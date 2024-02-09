//TODO: define tile width

class MapQuadTreeNode {
    #octreeMaxDepth = 19

    constructor(z, x, y, isRight, isDown) {
        this.z = z
        this.x = x
        this.y = y
        this.isRight = isRight
        this.isDown = isDown
        this.img = null
        this.children = [null, null, null, null]

        const imageUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
        // const imageUrl = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}.png`
        this.addImageToPage(imageUrl)
    }

    addChildNodes() {
        const tiles = [
            { x: 0, y: 0 },     // Top-left
            { x: 1, y: 0 },     // Top-right
            { x: 0, y: 1 },     // Bottom-left
            { x: 1, y: 1 }      // Bottom-right
        ];

        if (this.z + 1 <= this.#octreeMaxDepth) {
            for (let i = 0; i < 4; i++) {
                if (this.children[i] == null) {
                    const newX = 2 * this.x + tiles[i].x
                    const newY = 2 * this.y + tiles[i].y
                    this.children[i] = new MapQuadTreeNode(this.z + 1, newX, newY, tiles[i].x, tiles[i].y)
                }
            }
        }
    }

    deleteChildNodes() {
    }

    isImageOnScreen(imgPosX, imgPosY, imgWidth, imgHeight) {
        const imgRightEdge = imgPosX + imgWidth;
        const imgBottomEdge = imgPosY + imgHeight;
        const isVisibleHorizontally = imgRightEdge > 0 && imgPosX < window.innerWidth;
        const isVisibleVertically = imgBottomEdge > 0 && imgPosY < window.innerHeight;
        return isVisibleHorizontally && isVisibleVertically;
    }

    update(mapX, mapY, mapZ) {
        let imgWidth = 500 * mapZ
        if (this.z) {
            imgWidth /= Math.pow(2, this.z)
        }

        let posX = this.isRight ? mapX + imgWidth : mapX
        let posY = this.isDown ? mapY + imgWidth : mapY

        if (this.img) {
            this.img.width = imgWidth
            this.img.style.left = `${posX}px`
            this.img.style.top = `${posY}px`

            let minSize = Math.min(window.innerWidth, window.innerHeight)
            let sizeOnScreen = imgWidth / minSize
            if (sizeOnScreen > 0.5 && this.isImageOnScreen(posX, posY, imgWidth, imgWidth)) {
                this.addChildNodes()
            } else {
                this.deleteChildNodes()
            }
        }

        for (let i = 0; i < 4; i++) {
            if (this.children[i]) {
                this.children[i].update(posX, posY, mapZ)
            }
        }
    }

    addImageToPage(imageUrl) {
        this.img = document.createElement('img')

        this.img.src = imageUrl
        this.img.width = 500
        this.img.addEventListener('contextmenu', function (e) {
            e.preventDefault()
        });
        this.img.style.position = 'absolute'
        this.img.style.userSelect = 'none'
        this.img.style.border = '1px solid #a61603'

        const container = document.getElementById('contain')
        container.appendChild(this.img)
    }
}

class MapRenderer {
    constructor() {
        this.mapX = window.innerWidth / 2 - 250
        this.mapY = window.innerHeight / 2 - 250
        this.mapZ = 1.0

        this.isDragging = false
        this.prevX = 0
        this.prevY = 0

        this.root = new MapQuadTreeNode(0, 0, 0, 0, 0)

        this.fullscreenCapture = document.getElementById('fullscreen-capture')
        this.attachEventListeners()
        this.updateMapState();
    }

    updateMapState() {
        //clamp xy
        let imgW = 500 * this.mapZ
        if (imgW < window.innerWidth) {
            this.mapX = this.clamp(this.mapX, 0, window.innerWidth - imgW)
        }
        if (imgW < window.innerHeight) {
            this.mapY = this.clamp(this.mapY, 0, window.innerHeight - imgW)
        }

        this.root.update(this.mapX, this.mapY, this.mapZ)
    }

    attachEventListeners() {
        this.fullscreenCapture.addEventListener('mousedown', (e) => this.handleMouseDown(e))
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e))
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e))
        document.addEventListener('wheel', (e) => this.handleScroll(e))
    }

    handleScroll(e) {
        let scrollSpeed = 0.001
        let zoomIntensity = e.deltaY * scrollSpeed
        let exponentialFactor = 2
        let newZoom = this.mapZ * Math.pow(1 - zoomIntensity, exponentialFactor);
        newZoom = this.clamp(newZoom, 1.0, 400000.0)

        let mouseX = e.pageX - this.mapX
        let mouseY = e.pageY - this.mapY
        mouseX = mouseX * -1.0
        mouseY = mouseY * -1.0

        this.mapX = (mouseX * newZoom / this.mapZ) + this.mapX - mouseX;
        this.mapY = (mouseY * newZoom / this.mapZ) + this.mapY - mouseY;
        this.mapZ = newZoom;

        this.updateMapState();
    }

    handleMouseDown(e) {
        this.isDragging = true
        this.prevX = e.pageX
        this.prevY = e.pageY
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.pageX - this.prevX
            const deltaY = e.pageY - this.prevY

            this.mapX += deltaX
            this.mapY += deltaY

            this.prevX = e.pageX
            this.prevY = e.pageY
            this.updateMapState()
        }
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false
        }
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}

const mapRenderer = new MapRenderer()
