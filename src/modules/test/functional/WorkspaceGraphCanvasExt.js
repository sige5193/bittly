import {LGraphCanvas,LiteGraph} from 'litegraph.js'
export default class WorkspaceGraphCanvasExt {
    /**
     * extends graph canvas
     * @param {LGraphCanvas} graphCanvas 
     */
    static extends ( graphCanvas ) {
        graphCanvas.renderLink = WorkspaceGraphCanvasExt.renderLink;
    }
    
    /**
     * LGraphCanvas.renderLink
     * @override
     */
    static renderLink(ctx,a,b,link,skip_border,flow,color,start_dir,end_dir) {
        if (link) {
            this.visible_links.push(link);
        }

        //choose color
        if (!color && link) {
            color = link.color || LGraphCanvas.link_type_colors[link.type];
        }
        if (!color) {
            color = this.default_link_color;
        }
        if (link != null && this.highlighted_links[link.id]) {
            color = "#FFF";
        }

        start_dir = start_dir || LiteGraph.RIGHT;
        end_dir = end_dir || LiteGraph.LEFT;

        if (this.render_connections_border && this.ds.scale > 0.6) {
            ctx.lineWidth = this.connections_width + 4;
        }
        ctx.lineJoin = "round";

        //begin line shape
        ctx.beginPath();
        let line = WorkspaceGraphCanvasExt.renderLinkLine(ctx,a,b);

        //rendering the outline of the connection can be a little bit slow
        if (
            this.render_connections_border &&
            this.ds.scale > 0.6 &&
            !skip_border
        ) {
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.stroke();
        }

        ctx.lineWidth = this.connections_width;
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.stroke();
        //end line shape

        var pos = this.computeConnectionPoint(a, b, 0.5, start_dir, end_dir);
        if (link && link._pos) {
            link._pos[0] = pos[0];
            link._pos[1] = pos[1];
        }

        //render arrow in the middle
        if (
            this.ds.scale >= 0.6 &&
            this.highquality_render &&
            end_dir != LiteGraph.CENTER
        ) {
            //render arrow
            if (this.render_connection_arrows) {
                //compute two points in the connection
                var posA = this.computeConnectionPoint(
                    a,
                    b,
                    0.25,
                    start_dir,
                    end_dir
                );
                var posB = this.computeConnectionPoint(
                    a,
                    b,
                    0.26,
                    start_dir,
                    end_dir
                );
                var posC = this.computeConnectionPoint(
                    a,
                    b,
                    0.75,
                    start_dir,
                    end_dir
                );
                var posD = this.computeConnectionPoint(
                    a,
                    b,
                    0.76,
                    start_dir,
                    end_dir
                );

                //compute the angle between them so the arrow points in the right direction
                var angleA = 0;
                var angleB = 0;
                if (this.render_curved_connections) {
                    angleA = -Math.atan2(posB[0] - posA[0], posB[1] - posA[1]);
                    angleB = -Math.atan2(posD[0] - posC[0], posD[1] - posC[1]);
                } else {
                    angleB = angleA = b[1] > a[1] ? 0 : Math.PI;
                }

                //render arrow
                ctx.save();
                ctx.translate(posA[0], posA[1]);
                ctx.rotate(angleA);
                ctx.beginPath();
                ctx.moveTo(-5, -3);
                ctx.lineTo(0, +7);
                ctx.lineTo(+5, -3);
                ctx.fill();
                ctx.restore();
                ctx.save();
                ctx.translate(posC[0], posC[1]);
                ctx.rotate(angleB);
                ctx.beginPath();
                ctx.moveTo(-5, -3);
                ctx.lineTo(0, +7);
                ctx.lineTo(+5, -3);
                ctx.fill();
                ctx.restore();
            }

            //circle
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], 5, 0, Math.PI * 2);
            ctx.fill();
        }

        //render flowing points
        if (flow) {
            ctx.fillStyle = color;
            WorkspaceGraphCanvasExt.renderLinkFlowDot(ctx, line);
        }
    }

    /**
     * render link flow dot
     * @param {*} ctx 
     * @param {*} line 
     */
    static renderLinkFlowDot(ctx, line) {
        let dotCount = 5;
        let avgPartLen = line.length / dotCount;
        for (let i = 0; i < dotCount; ++i) {
            let timePercent =  (LiteGraph.getTime() % 1000) / 1000;
            let lengthPos = avgPartLen*i + avgPartLen * timePercent ;

            let partIndex = 0;
            let preLength = 0;
            for ( ; partIndex<line.parts.length; partIndex++ ) {
                let part = line.parts[partIndex];
                if ( preLength + part.len > lengthPos ) {
                    break;
                }
                preLength += part.len;
            }
            
            let dotX  = null;
            let dotY = null;
            let linePart = line.parts[partIndex];
            if ( linePart.isHorizontal ) {
                dotY = linePart.y;
                dotX = linePart.x + (lengthPos - preLength) * linePart.direction;
            } else {
                dotX = linePart.x;
                dotY = linePart.y + (lengthPos - preLength) * linePart.direction;
            }
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    /**
     * render link line
     * @param {*} ctx 
     * @param {*} start 
     * @param {*} end 
     * @returns {Object}
     */
    static renderLinkLine(ctx, start, end) {
        let line = {};
        line.length = 0;
        line.parts = [];
        
        let startX = start[0];
        let startY = start[1];
        var endX = end[0];
        var endY = end[1];
        let pinLen = 25;
        
        ctx.moveTo(startX, startY);
        
        // start pin
        let startPinEndX = startX + pinLen;
        line.length += pinLen;
        line.parts.push({
            x : startX,
            y : startY,
            len : pinLen,
            isHorizontal : true,
            direction : 1,
        });
        ctx.lineTo(startPinEndX, startY);

        // start vline
        let startVlineLen = Math.abs((endY - startY) / 2);
        let startVlineEndY = startY + (endY - startY) / 2;
        line.length += startVlineLen;
        line.parts.push({
            x : startX + pinLen,
            y : startY,
            len : startVlineLen,
            isHorizontal : false,
            direction : endY > startY ? 1 : -1,
        });
        ctx.lineTo(startPinEndX, startVlineEndY);

        // dist hline
        let distHlineEndX = endX - pinLen;
        let distHlineLen = Math.abs(startPinEndX - distHlineEndX);
        line.length += distHlineLen;
        line.parts.push({
            x : startPinEndX,
            y : startVlineEndY,
            len : distHlineLen,
            isHorizontal : true,
            direction : endX > startX ? 1 : -1,
        });
        ctx.lineTo(distHlineEndX, startVlineEndY);
        
        // end vline
        let endVlineLen = Math.abs(endY - startVlineEndY);
        let endVlineY = endY;
        line.length += endVlineLen;
        line.parts.push({
            x : distHlineEndX,
            y : startVlineEndY,
            len : endVlineLen,
            isHorizontal : false,
            direction : endY > startY ? 1 : -1,
        });
        ctx.lineTo(distHlineEndX, endVlineY);

        // end pin
        line.length += pinLen;
        line.parts.push({
            x : distHlineEndX,
            y : endVlineY,
            len : pinLen,
            isHorizontal : true,
            direction : 1,
        });
        ctx.lineTo(endX, endVlineY);

        return line;
    }
}