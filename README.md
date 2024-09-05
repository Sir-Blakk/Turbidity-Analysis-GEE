# Turbidity-Analysis-GEE
Turbidity Analysis of Water Bodies in Ghana using Google Earth Engine
Project Overview
This project focuses on analyzing the turbidity levels of water bodies (rivers, lakes, etc.) in Ghana using satellite imagery from the Sentinel-2 satellite, processed in Google Earth Engine (GEE). Turbidity refers to the cloudiness or murkiness of water and is an important indicator of water quality, particularly for assessing sediment levels and pollution.

In this project, we calculate the Normalized Difference Turbidity Index (NDTI) to measure turbidity across different water bodies in Ghana. The project includes code to visualize and export turbidity data in both raw and visualized formats.

Key Features

Data Source: Sentinel-2 surface reflectance images from the COPERNICUS/S2_SR_HARMONIZED collection for the year 2024.
Cloud Masking: Sentinel-2 images are filtered for cloud coverage below 10% to ensure data quality.
Water Masking: A mask is applied to focus on water bodies using the Normalized Difference Water Index (NDWI).
NDTI Calculation: The Normalized Difference Turbidity Index (NDTI) is computed to assess the turbidity levels of water bodies.
Visualization: A custom color palette is used to represent turbidity levels from low to high, making the turbidity variations visually clear.
Map Export: The resulting turbidity maps can be exported as GeoTIFF or PNG files for further analysis or display.
