// Load Ghana border and center the map
var ghana = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
             .filter(ee.Filter.eq('country_na', 'Ghana'));
Map.centerObject(ghana, 7);

// Filter the Sentinel-2 Image Collection
var collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                 .filterBounds(ghana)
                 .filterDate('2024-01-01', '2024-09-03')
                 .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
                 .map(function(image) {
                    var cloudMask = image.select('SCL').neq(9).and(image.select('SCL').neq(8));
                    return image.updateMask(cloudMask);
                 });

// Function to calculate multiple water indices
var calculateWaterIndices = function(image) {
  var ndti = image.normalizedDifference(['B4', 'B3']).rename('NDTI');
  var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
  var mndwi = image.normalizedDifference(['B3', 'B11']).rename('MNDWI');
  var awei = image.expression(
    '4 * (B3 - B11) - (0.25 * B8 + 2.75 * B12)', {
      'B3': image.select('B3'),
      'B8': image.select('B8'),
      'B11': image.select('B11'),
      'B12': image.select('B12')
    }).rename('AWEI');
    
  return image.addBands(ndti)
              .addBands(ndwi)
              .addBands(mndwi)
              .addBands(awei);
};

var waterIndicesCollection = collection.map(calculateWaterIndices);

// Create a combined water mask
var combinedWaterMask = function(image) {
  var ndwiMask = image.select('NDWI').gt(-0.1);
  var mndwiMask = image.select('MNDWI').gt(-0.1);
  var aweiMask = image.select('AWEI').gt(0);
  
  var waterMask = ndwiMask.or(mndwiMask).or(aweiMask);
  return image.updateMask(waterMask);
};

var waterMaskedCollection = waterIndicesCollection.map(combinedWaterMask);

// Calculate the mean NDTI for the water areas
var meanNDTI = waterMaskedCollection.select('NDTI').mean().clip(ghana);

// Define the visualization parameters
var ndtiVis = {
  min: -0.4, 
  max: 0.4, 
  palette: ['#ADD8E6', '#00FFFF', '#00CED1', '#ADFF2F', '#32CD32', '#FFFF00', '#FFA500', '#FF4500', '#8B0000', '#8B4513']
};

// Add the mean NDTI layer to the map
Map.addLayer(meanNDTI, ndtiVis, 'Mean NDTI');

// Display the map
Map.addLayer(ghana, {color: 'white'}, 'Ghana Border');

// Function to create a color palette legend
function addColorPaletteLegend(title, palette, min, max) {
  var legend = ui.Panel({
    style: {
      position: 'bottom-right',
      padding: '8px 15px'
    }
  });

  // Create the title of the legend
  var legendTitle = ui.Label({
    value: title,
    style: {
      fontWeight: 'bold',
      fontSize: '18px',
      margin: '0 0 4px 0',
      padding: '0'
    }
  });
  
  legend.add(legendTitle);

  // Create a row for each color
  var makeRow = function(color, name) {
    var colorBox = ui.Label({
      style: {
        backgroundColor: color,
        padding: '8px',
        margin: '0 0 4px 0'
      }
    });

    var description = ui.Label({
      value: name,
      style: {
        margin: '0 0 4px 6px'
      }
    });

    return ui.Panel({
      widgets: [colorBox, description],
      layout: ui.Panel.Layout.Flow('horizontal')
    });
  };

  // Define the legend labels
  var labels = ee.List.sequence(min, max, (max-min)/(palette.length-1)).getInfo();
  for (var i = 0; i < palette.length; i++) {
    legend.add(makeRow(palette[i], labels[i].toFixed(2)));
  }

  Map.add(legend);
}

// Add the legend to the map
addColorPaletteLegend('NDTI Legend', ndtiVis.palette, ndtiVis.min, ndtiVis.max);
// Export the mean NDTI image to Google Drive as a GeoTIFF
// Convert the mean NDTI image to an RGB image for PNG export
var rgbImage = meanNDTI.visualize(ndtiVis);

// Export the mean NDTI image to Google Drive as a GeoTIFF
Export.image.toDrive({
  image: meanNDTI,
  description: 'Mean_NDTI_Ghana',
  scale: 10,  // Adjust the scale to your preferred resolution (10m is the native resolution of Sentinel-2)
  region: ghana.geometry(),
  fileFormat: 'GeoTIFF',
  maxPixels: 1e13 // Adjust maxPixels if needed
});