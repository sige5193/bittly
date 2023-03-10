<!--
 - WebGL Plot
 - [O] zoom in and zoom out (pointer zoomming, dragged)
 - [O] cross line (zoomed, dragged)
 - [O] drag (zoomed)
 - [O] grid (dragged)
 - [O] tip
 - @TODO release as a npm package
-->
<template>
  <div class="flex-grow h-0 d-flex flex-dir-column pt-1 pr-1 position-relative">
    <div class="flex-grow h-0 d-flex flex-dir-row">
      <canvas ref="canvasPlotAxisY" class="border-right" style="width:30px;"></canvas>
      <canvas ref="canvasPlotMain" class="flex-grow w-0"></canvas>
    </div>
    <div class="d-flex flex-dir-row">
      <div style="width:30px;height: 1em;"></div>
      <canvas ref="canvasPlotAxisX" class="flex-grow border-top" style="height: 1em;width:0;"></canvas>
    </div>

    <div class="tip-holder" ref="tip"></div>
  </div>
</template>
<script>
import { WebglPlot, WebglLine, ColorRGBA } from "webgl-plot";
import MyNumber from '../../../../utils/datatype/MyNumber';
export default {
    name : 'DirectiveResponsePlotterPlotterWebGL',
    data() {
        return {
            /**
             * Rendering context for axis-y
             * @property {CanvasRenderingContext2D}
             */
            ctx2dPlotAxisY : null,
            /**
             * Rendering context for axis-x
             * @property {CanvasRenderingContext2D}
             */
            ctx2dPlotAxisX : null,
            /**
             * instance of webglplot
             * @property {WebglPlot}
             */
            plot : null,
            /**
             * aux line manager
             * @property {Object}
             */
            auxLines : {},
            /**
             * data line manager
             * @property {Array<Object>}
             */
            dataLines : [],
            /**
             * lines of grid
             * @property {Object}
             */
            gridLines : {x:[],y:[]},
            /**
             * dom rect of main canvas
             * @property {DOMRect}
             */
            rectCanvasPlotMain : null,
            /**
             * drag info
             * @property {Object}
             */
            drag : null,
            /**
             * x-y of mouse pointer inside plot
             * @property {Object}
             */
            pointer : {x:0,y:0},
            /**
             * number of x
             * @property {Number}
             */
            numberOfX : 10000,
        };
    },
    mounted() {
        this.plotSetup('create');
        requestAnimationFrame(() => this.animationDataRefresh());
    },
    methods : {
        /**
         * setup plot
         * @param {String} action
         */
        plotSetup( action ) {
            let devicePixelRatio = window.devicePixelRatio || 1;

            // init axis-y
            let canvasPlotAxisY = this.$refs.canvasPlotAxisY;
            this.ctx2dPlotAxisY = canvasPlotAxisY.getContext("2d");
            this.ctx2dPlotAxisY.font = "10px Courier New";
            this.ctx2dPlotAxisY.fillStyle = "#a7a7a7";
            this.ctx2dPlotAxisY.strokeStyle = "#a7a7a7";
            canvasPlotAxisY.width = canvasPlotAxisY.clientWidth * devicePixelRatio;
            canvasPlotAxisY.height = canvasPlotAxisY.clientHeight * devicePixelRatio;

            // init axis-x
            let canvasPlotAxisX = this.$refs.canvasPlotAxisX;
            this.ctx2dPlotAxisX = canvasPlotAxisX.getContext("2d");
            this.ctx2dPlotAxisX.font = "16px Courier New";
            this.ctx2dPlotAxisX.fillStyle = "#a7a7a7";
            this.ctx2dPlotAxisX.strokeStyle = "#a7a7a7";
            canvasPlotAxisX.width = canvasPlotAxisX.clientWidth * devicePixelRatio;
            canvasPlotAxisX.height = canvasPlotAxisX.clientHeight * devicePixelRatio;

            // main plot
            let canvasPlotMain =  this.$refs.canvasPlotMain;
            canvasPlotMain.width = canvasPlotMain.clientWidth * devicePixelRatio;
            canvasPlotMain.height = canvasPlotMain.clientHeight * devicePixelRatio;
            
            // init webgl plot
            let plot = new WebglPlot(canvasPlotMain);
            plot.removeAllLines();
            plot.gScaleX = 1;
            this.plot = plot;

            // add cross line
            let crossLineColor = new ColorRGBA(0.1, 0.9, 0.1, 1);
            plot.addAuxLine(new WebglLine(crossLineColor, 2));
            plot.addAuxLine(new WebglLine(crossLineColor, 2));
            this.auxLines = {crossX:{index:0},crossY:{index:1}};

            // grid
            this.gridLines = {x:[],y:[]};
            let gridXLineCount = 9;
            let gridYLineCount = 9;
            let gridColor = this.convertWebRGBAToPlotRGBA(236,236,236);
            for (let i = 0; i < gridXLineCount; i++) {
                let line = new WebglLine(gridColor, 2);
                let divPoint = (2 * i) / (gridXLineCount - 1) - 1;
                line.xy = new Float32Array([divPoint, -1, divPoint, 1]);
                plot.addLine(line);
                this.gridLines.x.push(line);
            }
            for (let i = 0; i < gridYLineCount; i++) {
                let line = new WebglLine(gridColor, 2);
                let divPoint = (2 * i) / (gridYLineCount - 1) - 1;
                line.xy = new Float32Array([-1, divPoint, 1, divPoint]);
                plot.addLine(line);
                this.gridLines.y.push(line);
            }

            plot.update();
            this.axisUpdate();
            this.rectCanvasPlotMain = canvasPlotMain.getBoundingClientRect();

            // bind events
            if ( 'create' === action ) {
                canvasPlotMain.addEventListener("mouseenter", event => this.handleMouseenter(event));
                canvasPlotMain.addEventListener("mouseleave", event => this.handleMouseleave(event));
                canvasPlotMain.addEventListener("mousemove", event => this.handleMousemove(event));
                canvasPlotMain.addEventListener("mousedown", event => this.handleMousedown(event));
                canvasPlotMain.addEventListener("mouseup", event => this.handleMouseup(event));
                canvasPlotMain.addEventListener("wheel", event => this.handleWheel(event));
            }
        },

        /**
         * convert web RGBA to plot RGBA
         * @param {number} red
         * @param {number} green
         * @param {number} blue
         * @param {number} alpha
         */
        convertWebRGBAToPlotRGBA( red, green, blue, alpha=1 ) {
            return new ColorRGBA(red/256, green/256, blue/256, alpha);
        },

        /**
         * event handler on mouse entered
         * @param {Event} event
         */
        handleMouseenter(event) {
            this.crossLineShow(event.pageX, event.pageY);
            this.tipShow(event.clientX, event.clientY);
        },

        /**
         * event handler on mouse leave
         * @param {Event} event
         */
        handleMouseleave(event) {
            this.tipHide();
            this.crossLineHide();
            this.dragStop();
            this.axisUpdate();
        },

        /**
         * event handler for canvas-plot-main mousedown
         * @param {Event} event
         */
        handleMousedown(event) {
            if ( 0 === event.button ) { // left key
                this.dragStart(event.clientX, event.clientY);
            }
        },

        /**
         * event handler for canvas-plot-main mousemove
         * @param {Event} event
         */
        handleMouseup(event) {
            this.dragStop();
            this.axisUpdate();
        },

        /**
         * event handler for canvas-plot-main mousemove
         * - drag move on dragging enabled
         * - update cross line
         * - update grid
         * - update the value tip
         * - update axis on dragging
         * @param {Event} event
         */
        handleMousemove(event) {
            this.dragMove(event.clientX, event.clientY);
            this.crossLineUpdate(event.pageX, event.pageY);
            this.tipUpdate(event.clientX, event.clientY);
            if ( this.dragIsMoving() ) {
                this.gridUpdate();
                this.axisUpdate();
            }
        },

        /**
         * event handler for canvas-plot-main wheel
         * - exec zooming
         * - update cross line
         * - update grid
         * - update axis
         * @param {Event} event
         */
        handleWheel(event) {
            let isScrollUp = 0 < event.deltaY;
            if ( event.ctrlKey ) {
                this.zoomAxisY(isScrollUp ? 1 : -1);
            } else {
                this.zoomAxisX(isScrollUp ? 1 : -1);
            }
            this.crossLineUpdate(event.pageX, event.pageY);
            this.gridUpdate();
            this.axisUpdate();
        },

        /**
         * execute zoom action for axis
         * @param {Number} direction
         */
        zoomAxisY( direction ) {
            const ZOOM_OUT = -1, ZOOM_IN = 1;
            let plot = this.plot;
            if ( 0 == plot.gScaleY && ZOOM_OUT === direction ) {
                return ;
            }

            // calculate scale number
            let scaleStepBase = 1000;
            let scaleStep = scaleStepBase * direction;
            let scaleStepCount = 0;
            let scale = parseInt(plot.gScaleY * scaleStepBase);
            if ( scale >= scaleStepBase && 1 < scale + scaleStep ) { // zoom : 1 ~ ∞
                scale += scaleStep;
            } else { // zoom : 1 ~ 0
                scaleStep = 1;
                while ( (ZOOM_OUT === direction && scaleStep * 10 < scale)
                || (ZOOM_IN === direction && scaleStep * 10 <= scale)) {
                    scaleStep *= 10;
                    scaleStepCount ++;
                }
                scale += scaleStep * direction;
            }
            scale = MyNumber.round(scale / scaleStepBase, 5);
            if ( 0 === scale ) {
                return ;
            }

            // calculate offset
            let offset = plot.gOffsetY;
            if ( ZOOM_OUT === direction ) {
                if ( 1 < plot.gScaleY ) {
                    offset += this.pointer.y;
                } else {
                    offset += this.pointer.y / Math.pow(10, 3 - scaleStepCount);
                    offset = MyNumber.round(offset, 5);
                }
            }
            if ( ZOOM_IN === direction ) {
                if ( 1 < scale ) {
                    offset -= this.pointer.y;
                } else {
                    offset -= this.pointer.y / Math.pow(10, 3 - scaleStepCount);
                    offset = MyNumber.round(offset, 5);
                }
            }

            plot.gOffsetY = offset;
            plot.gScaleY = scale;
        },

        /**
         * execute zoom action for axis
         * @param {Number} direction
         */
        zoomAxisX( direction ) {
            const ZOOM_OUT = -1, ZOOM_IN = 1;
            let plot = this.plot;
            if ( 0 == plot.gScaleX && ZOOM_OUT === direction ) {
                return ;
            }

            // calculate scale number
            let scaleStepBase = 1000;
            let scaleStep = scaleStepBase * direction;
            let scaleStepCount = 0;
            let scale = parseInt(plot.gScaleX * scaleStepBase);
            if ( scale >= scaleStepBase && 1 < scale + scaleStep ) { // zoom : 1 ~ ∞
                scale += scaleStep;
            } else { // zoom : 1 ~ 0
                scaleStep = 1;
                while ( (ZOOM_OUT === direction && scaleStep * 10 < scale)
                || (ZOOM_IN === direction && scaleStep * 10 <= scale)) {
                    scaleStep *= 10;
                    scaleStepCount ++;
                }
                scale += scaleStep * direction;
            }
            scale = MyNumber.round(scale / scaleStepBase, 5);
            if ( 0 === scale ) {
                return ;
            }

            // calculate offset
            let offset = plot.gOffsetX;
            if ( ZOOM_OUT === direction ) {
                if ( 1 < plot.gScaleX ) {
                    offset += this.pointer.x;
                } else {
                    offset += this.pointer.x / Math.pow(10, 3 - scaleStepCount);
                    offset = MyNumber.round(offset, 5);
                }
            }
            if ( ZOOM_IN === direction ) {
                if ( 1 < scale ) {
                    offset -= this.pointer.x;
                } else {
                    offset -= this.pointer.x / Math.pow(10, 3 - scaleStepCount);
                    offset = MyNumber.round(offset, 5);
                }
            }

            plot.gOffsetX = offset;
            plot.gScaleX = scale;
        },
        
        /**
         * update grid 
         */
        gridUpdate() {
            let plot = this.plot;
            
            let xStart = -(plot.gOffsetX + 1) / plot.gScaleX;
            let xEnd = -(plot.gOffsetX - 1) / plot.gScaleX;
            let xRange = (-(plot.gOffsetX - 1) / plot.gScaleX) - (-(plot.gOffsetX + 1) / plot.gScaleX);
            
            let yStart = -(plot.gOffsetY + 1) / plot.gScaleY;
            let yEnd = -(plot.gOffsetY - 1) / plot.gScaleY;
            let yRange = (-(plot.gOffsetY - 1) / plot.gScaleY) - (-(plot.gOffsetY + 1) / plot.gScaleY);

            for (let i = 0; i < this.gridLines.x.length; i++) {
                let line = this.gridLines.x[i];
                let divPoint = (xRange * i) / (this.gridLines.x.length - 1) + xStart;
                line.xy = new Float32Array([divPoint, yStart, divPoint, yEnd]);
            }

            for (let i = 0; i < this.gridLines.y.length; i++) {
                let line = this.gridLines.y[i];
                let divPoint = (yRange * i) / (this.gridLines.y.length - 1) + yStart;
                line.xy = new Float32Array([xStart, divPoint, xEnd, divPoint]);
            }
        },

        /**
         * update axis
         * @returns {void}
         */
        axisUpdate() {
            let plot = this.plot;

            // update axis-x
            let axisXdivs = 8;
            let canvasAxisX = this.$refs.canvasPlotAxisX;
            let canvasPlotAxisXCtx2d = this.ctx2dPlotAxisX;
            canvasPlotAxisXCtx2d.clearRect(0, 0, canvasAxisX.width, canvasAxisX.height);
            for (let i = 0; i < axisXdivs; i++) {
                let midpoint = -(plot.gOffsetX - i / (axisXdivs / 2) + 1) / plot.gScaleX;
                let x = (i / axisXdivs) * canvasAxisX.width;
                canvasPlotAxisXCtx2d.fillText(`${midpoint.toFixed(2)}`, x, 15);
                canvasPlotAxisXCtx2d.moveTo(x, 0);
                canvasPlotAxisXCtx2d.lineTo(x, 10);
                canvasPlotAxisXCtx2d.stroke();
            }
            
            // update axis-y
            let axisYdivs = 8;
            let canvasAxisY = this.$refs.canvasPlotAxisY;
            let canvasPlotAxisYCtx2d = this.ctx2dPlotAxisY;
            canvasPlotAxisYCtx2d.clearRect(0, 0, canvasAxisY.width, canvasAxisY.height);
            for (let i = 0; i < axisYdivs; i++) {
                const midpoint = -(plot.gOffsetY + i / (axisYdivs / 2) - 1) / plot.gScaleY;
                const y = (i / axisYdivs) * canvasAxisY.height;
                canvasPlotAxisYCtx2d.fillText(`${midpoint.toFixed(2)}`, 5, y);
                canvasPlotAxisYCtx2d.moveTo(canvasAxisY.width - 10, y);
                canvasPlotAxisYCtx2d.lineTo(canvasAxisY.width, y);
                canvasPlotAxisYCtx2d.stroke();
            }
        },

        /**
         * auto fix y-axis by given max and min value
         * @param {Number} max
         * @param {Number} min
         */
        axisYAutoFit( max, min ) {
            let mid = ( max - min ) / 2;
            if ( max === min ) {
                this.plot.gScaleY = 1;
                this.plot.gOffsetY = 0 - max;
            } else {
                this.plot.gScaleY = 2 / ( ( max - min ) * 2 );
                this.plot.gOffsetY = (0 - min + mid) * this.plot.gScaleY - 1;
            }
        },

        /**
         * start drag operation
         * @param {Number} clientX
         * @param {Number} clientY
         */
        dragStart(clientX, clientY) {
            let plot = this.plot;
            
            this.drag = {};
            this.drag.initialX = clientX;
            this.drag.offsetOldX = plot.gOffsetX;
            this.drag.initialY = clientY;
            this.drag.offsetOldY = plot.gOffsetY;
            this.$refs.canvasPlotMain.style.cursor = 'move';
        },

        /**
         * get whether is dragging
         * @returns {Boolean}
         */
        dragIsMoving() {
            return null != this.drag;
        },

        /**
         * move drag operation
         * @param {Number} clientX
         * @param {Number} clientY
         */
        dragMove(clientX, clientY) {
            if ( null === this.drag ) {
                return ;
            }

            let plot = this.plot;
            let contentRect = this.rectCanvasPlotMain;
            
            let xMoveRatio = (clientX - this.drag.initialX) / contentRect.width;
            let xRange = (-(plot.gOffsetX - 1) / plot.gScaleX) - (-(plot.gOffsetX + 1) / plot.gScaleX);
            let xMoveDistance = xRange * xMoveRatio * plot.gScaleX;
            plot.gOffsetX = this.drag.offsetOldX + xMoveDistance;

            let yMoveRatio = (clientY - this.drag.initialY) / contentRect.height;
            let yRange = (-(plot.gOffsetY - 1) / plot.gScaleY) - (-(plot.gOffsetY + 1) / plot.gScaleY);
            let yMoveDistance = yRange * yMoveRatio * plot.gScaleY;
            plot.gOffsetY = this.drag.offsetOldY - yMoveDistance;
        },

        /**
         * stop drag
         */
        dragStop() {
            if ( null === this.drag ) {
                return ;
            }
            this.drag = null;
            this.$refs.canvasPlotMain.style.cursor = 'default';
        },

        /**
         * show cross line
         * @param {Number} pageX
         * @param {Number} pageY
         */
        crossLineShow(pageX, pageY) {
            let auxLines = this.auxLines;
            this.plot.linesAux[auxLines.crossX.index].visible = true;
            this.plot.linesAux[auxLines.crossY.index].visible = true;
            this.crossLineUpdate(pageX, pageY);
        },

        /**
         * hide cross line
         * @returns {void}
         */
        crossLineHide() {
            let auxLines = this.auxLines;
            this.plot.linesAux[auxLines.crossX.index].visible = false;
            this.plot.linesAux[auxLines.crossY.index].visible = false;
        },

        /**
         * update cross line by given pagex and pagey
         * @param {Number} pageX
         * @param {Number} pageY
         */
        crossLineUpdate(pageX, pageY) {
            let plot = this.plot;
            let contentRect = this.rectCanvasPlotMain;
            let auxLines = this.auxLines;

            let mcWidth = contentRect.width;
            let x =(1 / plot.gScaleX) * ( 2 * (pageX - contentRect.left) / mcWidth - 1 - plot.gOffsetX);
            plot.linesAux[auxLines.crossX.index].xy = new Float32Array([
                /* start x-y */
                x, -(plot.gOffsetY + 1) / plot.gScaleY, 
                /* end x-y */
                x, -(plot.gOffsetY - 1) / plot.gScaleY
            ]);

            let mcHeight = contentRect.height;
            let y =(1 / plot.gScaleY) * ( 0 - 2 * (pageY - contentRect.top) / mcHeight + 1 - plot.gOffsetY);
            plot.linesAux[auxLines.crossY.index].xy = new Float32Array([
                /* start x-y */
                -(plot.gOffsetX + 1) / plot.gScaleX, y,
                /* end x-y */ 
                -(plot.gOffsetX - 1) / plot.gScaleX, y
            ]);

            this.pointer = {x:x,y:y};
        },

        /**
         * show tip
         * @param {Number} x
         * @param {Number} y
         * @returns {void}
         */
        tipShow(x, y) {
            this.$refs.tip.style.display = 'block';
            this.tipUpdate(x, y);
        },

        /**
         * update tip modal by given location
         * @param {Number} x
         * @param {Number} y
         */
        tipUpdate(x, y) {
            let tipStyle = this.$refs.tip.style;
            tipStyle.top = `${y-35}px`;
            tipStyle.left = `${x+5}px`;
            if ( 150 > window.innerWidth-(x+5) ) {
                tipStyle.left = `${x-150}px`;
            }

            let valueX = MyNumber.round(this.pointer.x, 5);
            let valueY = MyNumber.round(this.pointer.y, 5);
            this.$refs.tip.innerHTML = `Y:${valueY} X:${valueX}`;
        },

        /**
         * hide the tip
         * @returns {void}
         */
        tipHide() {
            this.$refs.tip.style.display = 'none';
        },
        
        /**
         * set data line labels
         * @param {Array<String>} labels
         */
        dataLineLabelsSet(labels) {
            for ( let i=0; i<labels.length; i++ ) {
                let line = this.dataLines[i];
                line.label = labels[i];
                this.$set(this.dataLines, i, line);
            }
        },

        /**
         * get all data lines
         * @returns {Array<Object>}
         */
        dataLineGetAll() {
            return this.dataLines;
        },

        /**
         * set data line visible
         * @param {Number} index
         * @param {Boolean} visible
         */
        dataLineVisibleSet ( index, visible ) {
            let line = this.dataLines[index];
            line.visible = visible;
            this.plot.linesData[line.index].visible = visible;
        },

        /**
         * append batch data to plot lines
         * @public
         * @param {Array<Array<Number>>} batchValues
         * @example 
         * ```javascript
         *   // for 3 lines to push 4 data items for each
         *   [[1,2,3],[4,5,6],[7,8,9],[10,11,12]] 
         * ```
         */
        dataBatchAppend( batchValues ) {
            if ( 0 === batchValues.length ) {
                return ;
            }

            let batchStartIndex = 0;
            // setup data lines with first group of values
            if ( 0 === this.dataLines.length ) {
                this.dataLineInit(batchValues[0]);
                batchStartIndex ++;
                let $this = this;
                this.$nextTick(()=>{
                    $this.gridUpdate();
                    $this.axisUpdate();
                });
            }

            let lines = this.plot.linesData;
            for (let i=batchStartIndex; i<this.dataLines.length; i++) {
                let values = [];
                
                for ( let li=0; li<batchValues.length; li++ ) {
                    let value = batchValues[li][i];
                    values.push(value);
                }
                
                let index = this.dataLines[i].index;
                lines[index].shiftAdd(values);
            }
        },
        
        /**
         * init data line by given values for each line
         * @private
         * @param {Array} values
         */
        dataLineInit( values ) {
            // colors for the first 10 lines
            let colors = [
                [244,67,54], [156,39,176], [63,81,181], [210,180,140], [0,150,136], 
                [76,175,80], [255,193,7],  [121,85,72], [158,158,158], [0,0,0]
            ];
            
            let numX = this.numberOfX;
            for (let i=0; i<values.length; i++) {
                // use buildin colors for the first 10 lines, and random color for the rest.
                let color = colors[i] || [MyNumber.random(0,255),MyNumber.random(0,255),MyNumber.random(0,255)];
                let lineColor = this.convertWebRGBAToPlotRGBA(color[0],color[1],color[2]);

                let line = new WebglLine(lineColor, numX);
                line.lineSpaceX(-1, 2 / numX);
                for ( let di=0; di<numX; di++ ) {
                    line.setY(di, values[i]);
                }
                this.dataLines.push({
                    index:this.plot.linesData.length,
                    label:`CH ${i+1}`,
                    color:color,
                    visible:true
                });
                this.plot.addDataLine(line);
            }

            this.axisYAutoFit(Math.max(... values), Math.min(... values));
        },

        /**
         * clean 
         */
        dataClear() {
            this.dataLines = [];
            this.plot.clear();
        },

        /**
         * refresh plot data
         * @private
         */
        animationDataRefresh() {
            if ( this._isDestroyed ) {
                return ;
            }
            this.plot.update();
            requestAnimationFrame(() => this.animationDataRefresh());
        },
        
        /**
         * resize the plotter
         */
        resize() {
            // cache data lines 
            let numX = this.numberOfX;
            let datalinesCache = [];
            for ( let i=0; i<this.dataLines.length; i++ ) {
                let line = this.dataLines[i];
                let plotDataLine = this.plot.linesData[line.index];
                let values = [];
                for ( let di=0; di<numX; di++ ) {
                    values.push(plotDataLine.getY(di));
                }
                datalinesCache.push(values);
            }

            // reset and update
            let canvasPlotMain =  this.$refs.canvasPlotMain;
            canvasPlotMain.width = 0;
            canvasPlotMain.height = 0;
            this.plotSetup('update');

            // restore data lines
            for ( let i=0; i<datalinesCache.length; i++ ) {
                let line = this.dataLines[i];
                let lineColor = this.convertWebRGBAToPlotRGBA(line.color[0],line.color[1],line.color[2]);
                let plotLine = new WebglLine(lineColor, numX);
                plotLine.visible = line.visible;
                plotLine.lineSpaceX(-1, 2 / numX);
                plotLine.shiftAdd(datalinesCache[i]);
                this.plot.addDataLine(plotLine);
                line.index = this.plot.linesData.length - 1;
            }

            this.gridUpdate();
        },
    },
}
</script>
<style scoped>
.tip-holder {
    display: none;
    left: 0;
    top: 0;
    position: fixed;
    min-width: 2px;
    min-height: 2px;
    background: red;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
    color: #fff;
    background-color: rgb(0 0 0 / 50%);
    border-radius: 5px;
    padding: 10px;
    text-align: center;
    line-height: 10px;
}
</style>