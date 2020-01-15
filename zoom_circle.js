/* eslint-disable no-undef */
/* eslint-disable space-before-function-paren */
/* eslint-disable eol-last */

// eslint-disable-next-line no-unused-vars
/**
 * @class
 * @classdesc Creates a data visualization based on circle packing with a zoomable function for user interactivity
 */
class ZoomableCircle /** @lends ZoomableCircle.prototype */ {
    /**
     * Sets inputs for the styling and formatting of the visualization. It also parses data from the given input
     * @constructor
     * @param  {url} dat - Link to a webpage containing the dataset
     * @param  {int} mar - Size of space between the visualization and the svg container
     * @param  {int} diam - Diameter of a bubble
     * @param  {array} cR - Colour scheme for the visualization [Format of input is in HSL - Hue (0-360), Saturation (0%-100%) and Lightness (0%-100%) in an array] An example of this would be ['hsl(-,-%,-%)', 'hsl(-,-%,-%)'])
     */
    constructor(url, mar, diam, cR) {
        this.data = url;
        this.margin = mar;
        if (mar) {
            this.margin = mar;
        } else {
            this.margin = 5;
        };
        this.svg = d3.select('svg');
        this.diameter = diam;
        if (diam) {
            this.diameter = diam;
        } else {
            this.diameter = 1500;
        };
        this.g = this.svg.append('g').attr('transform', 'translate(' + this.diameter / 2 + ',' + this.diameter / 2 + ')');
        this.colourRange = cR;
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
        d3.json(this.data, (error, root) => {
            if (error) throw error;
            x.root = d3.hierarchy(root)
                .sum(function(d) { return d.size; });
            x.focus = root;
            x.nodes = x.pack(x.root).descendants();
            x.draw();
        });
    }

    /**
     * Setter used to input new datasets into the same formatted visualization (*Optional function) This can be called using "[variable name].Updatedata = [url to dataset]"
     * @param {url} data - Link to new dataset
     */
    set Updatedata (data) {
        this.data = data;
        const DataVis = new ZoomableCircle(this.data);
    }

    /**
     * Takes the split data from the dataset and creates zoomable circles or 'bubbles' based on each data. Based on the structure of the json file, each 'name' will create a node while for each 'children' declared, a subnode is created which is shown as a smaller circle embedded in the bigger circle. The function also sets up the background colour of the svg
     */
    draw() {
        const x = this;

        this.circle = this.g.selectAll('circle')
            .data(this.nodes)
            .enter().append('circle')
            .attr('class', (d) => { return d.parent ? d.children ? 'node' : 'node node--leaf' : 'node node--root'; })
            .style('fill', (d) => { return d.children ? this.color(d.depth) : null; })
            .on('click', function(d) {
                if (x.focus !== d) {
                    x.zoom(d);
                    d3.event.stopPropagation();
                }
            });

        this.text = this.g.selectAll('text')
            .data(this.nodes)
            .enter().append('text')
            .attr('class', 'label')
            .style('fill-opacity', (d) => { return d.parent === this.root ? 1 : 0; })
            .style('display', (d) => { return d.parent === this.root ? 'inline' : 'none'; })
            .text(function(d) { return d.data.name; });

        this.node = this.g.selectAll('circle,text');
        this.svg
            .style('background', this.color(-1))
            .on('click', () => { this.zoom(this.root); });

        this.zoomTo([this.root.x, this.root.y, this.root.r * 2 + this.margin]);
    }

    /**
     * Zooms into the circle
     * @param  {any} d - Data currently binded to the current element
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
            .on('end', function(d) { if (d.parent !== focus) this.style.display = 'none'; });
    }

    /**
     * Pans the "camera" view to the location of the circle which is to be zoomed in on
     * @param  {function} v - Interpolator between the two views (each taking the coordinates of the centre of the viewport and the width of the viewport) on a 2D plane 
     */
    zoomTo(v) {
        const k = this.diameter / v[2];
        this.view = v;
        this.node.attr('transform', function(d) { return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')'; });
        this.circle.attr('r', function(d) { return d.r * k; });
    }
}
