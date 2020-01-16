/* eslint-disable no-undef */
/* eslint-disable space-before-function-paren */
/* eslint-disable eol-last */

// eslint-disable-next-line no-unused-vars
/**
 * @class
 * @classdesc Creates a data visualization based on circle packing with a zoomable function for user interactivity
 */
// eslint-disable-next-line no-unused-vars
class ZoomableCircle /** @lends ZoomableCircle.prototype */ {
    /**
     * Sets inputs for the styling and formatting of the visualization.<br>It also parses data from the given input.
     * @constructor
    * @param  {url} url - Link to a webpage containing the dataset (The dataset itself should be in a json file with a structure as so: {'name': {string}, 'children':[{'name':{string}, 'children':[{'name':{string}, 'size':{int/float}}, {
    * 'name':{string}, 'size':{int/float}, ...}] }]})
     * @param  {integer} mar - Size of space between the visualization and the svg container
     * @param  {integer} diam - Diameter of a bubble
     * @param  {array} cR - Colour scheme for the visualization [Format of input is in HSL - Hue (0-360), Saturation (0%-100%) and Lightness (0%-100%) in an array] An example of this would be ['hsl(-,-%,-%)', 'hsl(-,-%,-%)'])
     * @param  {function} this.svg - Selects the svg container for which the visualization is displayed on
     * @param  {object} this.g - All circles and text append to the svg container
     * @param  {object} this.color - Sets the colour for the circles
     * @param  {object} this.pack - Creates a circle packing layout
     */
    constructor(url, mar, diam, cR) {
        this.data = url;
        this.margin = mar;
        // Error handling for margin
        if (mar) {
            this.margin = mar;
        } else {
            this.margin = 5;
        };
        this.svg = d3.select('svg');
        this.diameter = diam;
        // Error handling for diameter
        if (diam) {
            this.diameter = diam;
        } else {
            this.diameter = 1500;
        };
        this.g = this.svg.append('g').attr('transform', 'translate(' + this.diameter / 2 + ',' + this.diameter / 2 + ')');
        this.colourRange = cR;
        // Error handling for colour range
        if (cR) {
            this.colourRange = cR;
        } else {
            this.colourRange = ['hsl(200,100%,90%)', 'hsl(700,50%,70%)'];
        };
        this.color = d3.scaleLinear()
            .domain([-1, 5])
            .range(this.colourRange)
            .interpolate(d3.interpolateHcl);

        this.pack = d3.pack()
            .size([this.diameter - this.margin, this.diameter - this.margin])
            .padding(2);

        const x = this;
        // this function parses data
        d3.json(this.data, (error, root) => {
            if (error) throw error;
            x.root = d3.hierarchy(root)
                .sum(function(d) { return d.size; });
            x.focus = root;
            x.nodes = x.pack(x.root).descendants(); // assigns values to nodes
            x.draw(); // draw function is called
        });
    }

/**
 * Setter used to input new datasets into the same formatted visualization (*Optional function)<br>This can be called using "[variable name].Updatedata = [url to dataset]".
 * @function
 * @param {url} data - Link to new dataset
 */
    set Updatedata (data) {
        this.data = data;
        // eslint-disable-next-line no-unused-vars
        const DataVis = new ZoomableCircle(this.data); // refreshes visualization with new dataset
    }

/**
 * Takes the split data from the dataset and creates zoomable circles or 'bubbles' based on each data. Based on the structure of the json file, each 'name' will create a node while for each 'children' declared, a subnode is created which is shown as a smaller circle embedded in the bigger circle.<br>The function also sets up the background colour of the svg.
 * @function
 * @param {object} this.circle - Creates the circle(s)
 * @param {object} this.text - Creates the text(s) on the circle(s)
 * @param {object} this.node - Selects all the circles and texts
 */
    draw() {
        const x = this;

        this.circle = this.g.selectAll('circle')
            .data(this.nodes) //
            .enter().append('circle') // for each data value, a circle is created
            .attr('class', (d) => { return d.parent ? d.children ? 'node' : 'node node--leaf' : 'node node--root'; })
            .style('fill', (d) => { return d.children ? this.color(d.depth) : null; }) // sets colour for layer of circle
            .on('click', function(d) { // view zooms in upon click
                if (x.focus !== d) {
                    x.zoom(d);
                    d3.event.stopPropagation();
                }
            });

        this.text = this.g.selectAll('text')
            .data(this.nodes)
            .enter().append('text') // every "name" is assigned to text
            .attr('class', 'label')
            .style('fill-opacity', (d) => { return d.parent === this.root ? 1 : 0; })
            .style('display', (d) => { return d.parent === this.root ? 'inline' : 'none'; })
            .text(function(d) { return d.data.name; }); // 'name' is displayed on each circle

        this.node = this.g.selectAll('circle,text'); // every circle with text is a node
        this.svg
            .style('background', this.color(-1))
            .on('click', () => { this.zoom(this.root); });

        this.zoomTo([this.root.x, this.root.y, this.root.r * 2 + this.margin]); // assigns centre of viewport and width of viewport
    }

    /**
     * Zooms into the circle with a set duration. During the transition, the text display on outer node will disappear while the text on the inner node will display.
     * @function
     * @param  {any} d - Data currently binded to the current element
     * @param  {function} this.transition - Zooming into circles
     */
    zoom(d) {
        // eslint-disable-next-line no-unused-vars
        const focus = d;
        const x = this;

        this.transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween('zoom', (d) => {
                const i = d3.interpolateZoom(this.view, [focus.x, focus.y, focus.r * 2 + this.margin]);
                return function(t) { x.zoomTo(i(t)); };
            });

        this.transition.selectAll('text')
            .filter(function(d) { return d.parent === focus || this.style.display === 'inline'; })
            .style('fill-opacity', function(d) { return d.parent === focus ? 1 : 0; })
            .on('start', function(d) { if (d.parent === focus) this.style.display = 'inline'; })
            .on('end', function(d) { if (d.parent !== focus) this.style.display = 'none'; }); // if previous node not in focus, then the text will not be displayed for that previous node
    }

    /**
     * Pans the "camera" view to the location of the circle which is to be zoomed in on.
     * @function
     * @param  {function} v - Interpolator between the two views (each taking the coordinates of the centre of the viewport and the width of the viewport) on a 2D plane
     * */
    zoomTo(v) {
        const k = this.diameter / v[2];
        this.view = v;
        this.node.attr('transform', function(d) { return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')'; });
        this.circle.attr('r', function(d) { return d.r * k; });
    }
}
