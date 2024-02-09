class MapRenderer {
    constructor() {
        this.mapX = 0.0
        this.mapY = 0.0

        this.img = null

        this.isDragging = false
        this.prevX = 0
        this.prevY = 0

        this.fullscreenCapture = document.getElementById('fullscreen-capture')
        this.attachEventListeners()

        const imageUrl = 'https://tile.openstreetmap.org/0/0/0.png'
        this.displayImage(imageUrl)
    }

    updateMapImages() {
        if (this.img) {
            this.img.style.left = `${this.mapX}px`;
            this.img.style.top = `${this.mapY}px`;
        }
    }

    attachEventListeners() {
        this.fullscreenCapture.addEventListener('mousedown', (e) => this.handleMouseDown(e))
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e))
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e))
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
