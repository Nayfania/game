function Heap() {
    this.nodes = [];
}

Heap.prototype._siftup = function (pos) {
    var childpos, endpos, newitem, rightpos, startpos;
    endpos = this.nodes.length;
    startpos = pos;
    newitem = this.nodes[pos];
    childpos = 2 * pos + 1;
    while (childpos < endpos) {
        rightpos = childpos + 1;
        let childNode = this.nodes[childpos];
        let rightNode = this.nodes[rightpos];
        if (rightpos < endpos && !((childNode.f - rightNode.f) < 0)) {
            childpos = rightpos;
        }
        this.nodes[pos] = this.nodes[childpos];
        pos = childpos;
        childpos = 2 * pos + 1;
    }
    this.nodes[pos] = newitem;
    this._siftdown(startpos, pos);
};

Heap.prototype._siftdown = function (startpos, pos) {
    var newitem, parent, parentpos;
    newitem = this.nodes[pos];
    while (pos > startpos) {
        parentpos = (pos - 1) >> 1;
        parent = this.nodes[parentpos];
        if ((newitem.f - parent.f) < 0) {
            this.nodes[pos] = parent;
            pos = parentpos;
            continue;
        }
        break;
    }
    this.nodes[pos] = newitem;
};

Heap.prototype.push = function (x) {
    this.nodes.push(x);

    var pos = this.nodes.length - 1;
    var newitem, parent, parentpos;
    newitem = this.nodes[pos];
    while (pos > 0) {
        parentpos = (pos - 1) >> 1;
        parent = this.nodes[parentpos];
        if ((newitem.f - parent.f) < 0) {
            this.nodes[pos] = parent;
            pos = parentpos;
            continue;
        }
        break;
    }

    this.nodes[pos] = newitem;
};

Heap.prototype.pop = function () {
    var lastelt, returnitem;
    lastelt = this.nodes.pop();
    if (this.nodes.length) {
        returnitem = this.nodes[0];
        this.nodes[0] = lastelt;
        this._siftup(0);
    } else {
        returnitem = lastelt;
    }

    return returnitem;
};

Heap.prototype.updateItem = function (x) {

    var pos = this.nodes.indexOf(x);
    if (pos === -1) {
        return;
    }

    this._siftdown(0, pos);
    this._siftup(pos);
};

Heap.prototype.empty = function () {
    return this.nodes.length === 0;
};

function Node(x, y) {
    this.x = x;
    this.y = y;
    this.walkable = true;
    this.g = 0;
    this.f = 0;
}

function AStarFinder(matrix) {
    this.height = matrix.length;
    this.width = matrix[0].length;

    this.nodes = new Array(this.height);

    for (let y = 0; y < this.height; ++y) {
        this.nodes[y] = new Array(this.width);
        for (let x = 0; x < this.width; ++x) {
            this.nodes[y][x] = new Node(x, y);
            if (matrix[y][x]) {
                this.nodes[y][x].walkable = false;
            }
        }
    }

    this.openList = new Heap();
}

AStarFinder.prototype.octile = function (dx, dy) {
    var F = Math.SQRT2 - 1;
    return (dx < dy) ? F * dx + dy : F * dy + dx;
};

AStarFinder.prototype.findPath = function (startX, startY, endX, endY) {
    var startNode = this.getNodeAt(startX, startY),
        endNode = this.getNodeAt(endX, endY),
        node, neighbors, neighbor, i, l, x, y, ng;

    // push the start node into the open list
    this.openList.push(startNode);
    startNode.opened = true;

    // while the open list is not empty
    while (!this.openList.empty()) {
        // pop the position of node which has the minimum `f` value.
        node = this.openList.pop();
        node.closed = true;

        // if reached the end position, construct the path and return it
        if (node === endNode) {
            var path = [[endNode.x, endNode.y]];
            while (endNode.parent) {
                endNode = endNode.parent;
                path.push([endNode.x, endNode.y]);
            }
            return path.reverse();
        }

        neighbors = this.getNeighbors(node);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];

            if (neighbor.closed) {
                continue;
            }

            x = neighbor.x;
            y = neighbor.y;

            // get the distance between current node and the neighbor
            // and calculate the next g score
            ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : Math.SQRT2);

            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h || this.octile(Math.abs(x - endX), Math.abs(y - endY));
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;

                if (!neighbor.opened) {
                    this.openList.push(neighbor);
                    neighbor.opened = true;
                } else {
                    this.openList.updateItem(neighbor);
                }
            }
        }
    }

    return [];
};

AStarFinder.prototype.getNodeAt = function (x, y) {
    return this.nodes[y][x];
};

AStarFinder.prototype.isWalkableAt = function (x, y) {
    var isInside = (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
    return isInside && this.nodes[y][x].walkable;
};

AStarFinder.prototype.getNeighbors = function (node) {
    var x = node.x,
        y = node.y,
        neighbors = [],
        s0 = false,
        s1 = false,
        s2 = false,
        s3 = false;

    // ↑
    if (this.isWalkableAt(x, y - 1)) {
        neighbors.push(this.nodes[y - 1][x]);
        s0 = true;
    }
    // →
    if (this.isWalkableAt(x + 1, y)) {
        neighbors.push(this.nodes[y][x + 1]);
        s1 = true;
    }
    // ↓
    if (this.isWalkableAt(x, y + 1)) {
        neighbors.push(this.nodes[y + 1][x]);
        s2 = true;
    }
    // ←
    if (this.isWalkableAt(x - 1, y)) {
        neighbors.push(this.nodes[y][x - 1]);
        s3 = true;
    }

    var d0 = s3 || s0;
    var d1 = s0 || s1;
    var d2 = s1 || s2;
    var d3 = s2 || s3;

    // ↖
    if (d0 && this.isWalkableAt(x - 1, y - 1)) {
        neighbors.push(this.nodes[y - 1][x - 1]);
    }
    // ↗
    if (d1 && this.isWalkableAt(x + 1, y - 1)) {
        neighbors.push(this.nodes[y - 1][x + 1]);
    }
    // ↘
    if (d2 && this.isWalkableAt(x + 1, y + 1)) {
        neighbors.push(this.nodes[y + 1][x + 1]);
    }
    // ↙
    if (d3 && this.isWalkableAt(x - 1, y + 1)) {
        neighbors.push(this.nodes[y + 1][x - 1]);
    }

    return neighbors;
};