currentCanvas.beginPath();
        currentCanvas.lineCap = 'round';
        currentCanvas.strokeStyle = "black";
        currentCanvas.lineWidth = "2";
        currentCanvas.moveTo(queue[0].x, queue[0].y);

        //queue is an array of original points which were stored while onmousemove event callback

        var tempQueue1 = [queue[0]];
        for (var i = 1; i < queue.length - 1;  i = i+1) {
            //if((Math.abs(queue[i].x - queue[i-1].x) >3 || Math.abs(queue[i].x - queue[i-1].x)<1) &&  (Math.abs(queue[i].y - queue[i-1].y) >3 || Math.abs(queue[i].y - queue[i-1].y)<1)){
                var c = (queue[i].x + queue[i + 1].x) / 2;
                var d = (queue[i].y + queue[i + 1].y) / 2;
                //tempQueue.push(queue[i]);
                tempQueue1.push({x:c, y:d});
                //currentCanvas.quadraticCurveTo(queue[i].x, queue[i].y, c, d);
            //}
        }

        var tempQueue2 = [tempQueue1[0]];
        for (var i = 1; i < tempQueue1.length - 1;  i = i+1) {
            //if((Math.abs(queue[i].x - queue[i-1].x) >3 || Math.abs(queue[i].x - queue[i-1].x)<1) &&  (Math.abs(queue[i].y - queue[i-1].y) >3 || Math.abs(queue[i].y - queue[i-1].y)<1)){
                var c = (tempQueue1[i].x + tempQueue1[i + 1].x) / 2;
                var d = (tempQueue1[i].y + tempQueue1[i + 1].y) / 2;
                //tempQueue.push(queue[i]);
                tempQueue2.push({x:c, y:d});
                //currentCanvas.quadraticCurveTo(queue[i].x, queue[i].y, c, d);
            //}
        }

        var tempQueue = [tempQueue2[0]];
        for (var i = 1; i < tempQueue2.length - 1;  i = i+1) {
            //if((Math.abs(queue[i].x - queue[i-1].x) >3 || Math.abs(queue[i].x - queue[i-1].x)<1) &&  (Math.abs(queue[i].y - queue[i-1].y) >3 || Math.abs(queue[i].y - queue[i-1].y)<1)){
                var c = (tempQueue2[i].x + tempQueue2[i + 1].x) / 2;
                var d = (tempQueue2[i].y + tempQueue2[i + 1].y) / 2;
                //tempQueue.push(queue[i]);
                tempQueue.push({x:c, y:d});
                //currentCanvas.quadraticCurveTo(queue[i].x, queue[i].y, c, d);
            //}
        }

        for (var i = 1; i < tempQueue.length - 2;  i = i+1) {
            //if((Math.abs(queue[i].x - queue[i-1].x) >3 || Math.abs(queue[i].x - queue[i-1].x)<1) &&  (Math.abs(queue[i].y - queue[i-1].y) >3 || Math.abs(queue[i].y - queue[i-1].y)<1)){
                var c = (tempQueue[i].x + tempQueue[i + 1].x) / 2;
                var d = (tempQueue[i].y + tempQueue[i + 1].y) / 2;
                currentCanvas.quadraticCurveTo(tempQueue[i].x, tempQueue[i].y, c, d);
            //}
        }

        // For the last 2 points
        currentCanvas.quadraticCurveTo(
        tempQueue[i].x,
        tempQueue[i].y,
        tempQueue[i+1].x,
        tempQueue[i+1].y
        );
        currentCanvas.stroke();
        queue = [];
