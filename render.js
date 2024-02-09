class MapRenderer {
    constructor() {
        this.mapX = 0.0
        this.mapY = 0.0
        this.mapZ = 1.0

        this.isDragging = false
        this.prevX = 0
        this.prevY = 0

        this.img = null

        this.fullscreenCapture = document.getElementById('fullscreen-capture')
        this.attachEventListeners()

        const imageUrl = 'https://tile.openstreetmap.org/0/0/0.png'
        // const imageUrl = 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{0}/{0}/{0}'

        this.displayImage(imageUrl)
    }

    updateMapImages() {
        if (this.img) {
            this.img.style.left = `${this.mapX}px`
            this.img.style.top = `${this.mapY}px`
            this.img.width = 500 * this.mapZ
        }
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

        let mouseX = e.pageX - this.mapX
        let mouseY = e.pageY - this.mapY
        mouseX = mouseX * -1.0
        mouseY = mouseY * -1.0

        this.mapX = (mouseX * newZoom / this.mapZ) + this.mapX - mouseX;
        this.mapY = (mouseY * newZoom / this.mapZ) + this.mapY - mouseY;
        this.mapZ = newZoom;

        //TODO clamp
        // this.mapZ = Math.max(this.mapZ, 0.1);
        // this.mapZ = Math.min(this.mapZ, 10);
        this.updateMapImages();
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
            //TODO clamp

            this.prevX = e.pageX
            this.prevY = e.pageY
            this.updateMapImages()
        }
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false
        }
    }

    displayImage(imageUrl) {
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

const mapRenderer = new MapRenderer()
