class MapQuadTreeNode {
    constructor(z, y, x) {
        this.z = z
        this.x = x
        this.y = y
        this.children = [null, null, null, null]
        this.img = null

        const imageUrl = 'https://tile.openstreetmap.org/0/0/0.png'
        // const imageUrl = 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{0}/{0}/{0}'
        this.addImageToPage(imageUrl)
    }

    update(mapX, mapY, mapZ) {
        if (this.img) {
            this.img.style.left = `${mapX}px`
            this.img.style.top = `${mapY}px`
            this.img.width = 500 * mapZ
        }
    }

    addImageToPage(imageUrl) {
        this.img = document.createElement('img')

        this.img.src = imageUrl
        this.img.width = 500
        this.img.addEventListener('contextmenu', function (e) {
            e.preventDefault()
        });
        this.img.style.position = 'absolute';
        this.img.style.userSelect = 'none'

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

        this.root = new MapQuadTreeNode(0, 0, 0)

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
        //TODO clamp max
        // console.log('newz', newZoom)
        newZoom = this.clamp(newZoom, 1.0, 999999999999999)

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
