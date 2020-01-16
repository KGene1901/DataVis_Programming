
# Data Visualization Programming Summative 

Type of visualization used: Zoomable Circle Packing (Original source code: https://gist.github.com/mbostock/7607535)
Dataset used: UNICEF Reports 2018

## Getting Started

The entire visualization is encapusulated in a class called ZoomableCircle with 4 user-input based parameters for the constructor. These parameters are url (url to dataset), mar (margin), diam (diameter), cR (colour range). The format for url and cR are shown in the jsdoc. 

An example to create the visualization is as so:

```
const DataVis = new ZoomableCircle('https://raw.githubusercontent.com/KGene1901/DataVis_Programming/master/unicef_data.json', 5, 1500, ['hsl(200,100%,90%)', 'hsl(700,50%,70%)']);
```
This can directly be called from the html file with a script tag. However, in my visualization it has already been called. 

There is also an option for users to update the dataset in the visualization with their own dataset with the setter function Updatedata(data). Look at the notes on jsdoc on how to call it.

### Examples

Below are two json files I have provided for testing of the visualization:

```
'https://raw.githubusercontent.com/KGene1901/DataVis_Programming/master/unicef_data.json'
```
```
'https://gist.githubusercontent.com/mbostock/7607535/raw/863bb1f3dcc8f104f1b52318f6ee927d5c54d678/flare.json'
```

## Versioning

I used 'version 1.1' of svg ("http://www.w3.org/2000/svg") and v4 of d3 ("https://d3js.org/d3.v4.min.js"). 

## Acknowledgement

README.md-template: https://gist.github.com/PurpleBooth/109311bb0361f32d87a2

## License

https://creativecommons.org/licenses/by-nc-sa/4.0/ 



