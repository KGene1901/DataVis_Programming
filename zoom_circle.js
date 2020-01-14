/* eslint-disable no-undef */
/* eslint-disable space-before-function-paren */
/* eslint-disable eol-last */

class ZoomableCircle {
    /**
     @constructor
     */
    /**
     * @param  {json} dat
     * @param  {int} mar
     * @param  {int} diam
     * @param  {array} cR
     */
    constructor(dat, mar, diam, cR) {
        this.data = dat; // json file i.e. 'unicef_data.json'
        this.margin = mar; // 20
        this.svg = d3.select('svg');
        this.diameter = diam; // (+svg.attr('width'))
        this.g = this.svg.append('g').attr('transform', 'translate(' + this.diameter / 2 + ',' + this.diameter / 2 + ')');
        this.colourRange = cR;
        this.color = d3.scaleLinear()
            .domain([-1, 5])
            .range(this.colourRange) // ['hsl(200,100%,90%)', 'hsl(700,50%,70%)'] <- in this format
            .interpolate(d3.interpolateHcl);

        this.pack = d3.pack()
            .size([this.diameter - this.margin, this.diameter - this.margin])
            .padding(2);
        const x = this;
        d3.json(this.data, function(error, root) {
            if (error) throw error;

            x.root = d3.hierarchy(root)
                .sum(function(d) { return d.size; })
                .sort(function(a, b) { return b.value - a.value; });

            x.focus = root;
            x.nodes = x.pack(root).descendants();
            x.view;
        });
    }

    draw() {
        this.circle = this.g.selectAll('circle')
            .data(this.nodes);
        console.log(this.circle);
        this.circle = this.circle
            .enter().append('circle')
            .attr('class', function(d) { return d.parent ? d.children ? 'node' : 'node node--leaf' : 'node node--root'; })
            .style('fill', function(d) { return d.children ? color(d.depth) : null; })
            .on('click', function(d) { if (this.focus !== d) zoom(d), d3.event.stopPropagation(); });

        this.text = this.g.selectAll('text')
            .data(this.nodes)
            .enter().append('text')
            .attr('class', 'label')
            .style('fill-opacity', function(d) { return d.parent === root ? 1 : 0; })
            .style('display', function(d) { return d.parent === root ? 'inline' : 'none'; })
            .text(function(d) { return d.data.name; });

        this.node = g.selectAll('circle,text');
        svg
            .style('background', color(-1))
            .on('click', function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + this.margin]);
    }

    zoom(d, v) {
        // eslint-disable-next-line no-unused-vars
        const focus0 = focus;
        this.focus = d;

        this.transition = this.d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween('zoom', function(d) {
                this.i = d3.interpolateZoom(this.view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function(t) { zoomTo(i(t)); };
            });

        this.transition.selectAll('text')
            .filter(function(d) { return d.parent === focus || this.style.display === 'inline'; })
            .style('fill-opacity', function(d) { return d.parent === focus ? 1 : 0; })
            .on('start', function(d) { if (d.parent === focus) this.style.display = 'inline'; })
            .on('end', function(d) { if (d.parent !== focus) this.style.display = 'none'; });

        this.k = this.diameter / v[2];
        this.view = v;
        this.node.attr('transform', function(d) { return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')'; });
        this.circle.attr('r', function(d) { return d.r * k; });
    }
}

let DataVis = new ZoomableCircle('unicef_data.json', 20, 960, ['hsl(200,100%,90%)', 'hsl(700,50%,70%)']);
DataVis.draw();
// DataVis.zoom(d, v);