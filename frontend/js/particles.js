
class ParticleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 80;
        this.mouse = { x: null, y: null, radius: 150 };
        this.mouseVelocity = { x: 0, y: 0 };
        
        this.init();
        this.animate();
        this.addEventListeners();
    }
    
    init() {
        this.resize();
        this.createParticles();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                baseX: 0,
                baseY: 0,
                density: Math.random() * 30 + 1,
                vx: Math.random() * 0.5 - 0.25,
                vy: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        

        this.particles.forEach(particle => {
            particle.baseX = particle.x;
            particle.baseY = particle.y;
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, index) => {

            this.ctx.fillStyle = `rgba(200, 180, 255, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            

            for (let j = index + 1; j < this.particles.length; j++) {
                const dx = this.particles[j].x - particle.x;
                const dy = this.particles[j].y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (1 - distance / 120) * 0.3;
                    this.ctx.strokeStyle = `rgba(220, 200, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        });
    }
    
    moveParticles() {
        this.particles.forEach(particle => {

            particle.x += particle.vx;
            particle.y += particle.vy;
            

            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
            }
            

            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = this.mouse.radius;
                const force = (maxDistance - distance) / maxDistance;
                
                if (distance < this.mouse.radius) {

                    const directionX = forceDirectionX * force * particle.density * 0.3;
                    const directionY = forceDirectionY * force * particle.density * 0.3;
                    particle.x -= directionX;
                    particle.y -= directionY;
                }
            }
            

            const dx = particle.baseX - particle.x;
            const dy = particle.baseY - particle.y;
            particle.x += dx * 0.05;
            particle.y += dy * 0.05;
        });
    }
    
    animate() {
        this.drawParticles();
        this.moveParticles();
        requestAnimationFrame(() => this.animate());
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
        

        this.canvas.addEventListener('mousemove', (e) => {
            const newX = e.x;
            const newY = e.y;
            
            this.mouseVelocity.x = newX - (this.mouse.x || newX);
            this.mouseVelocity.y = newY - (this.mouse.y || newY);
            
            this.mouse.x = newX;
            this.mouse.y = newY;
        });
        

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        

        window.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            
            this.particles.forEach(particle => {
                const speed = particle.density / 30;
                particle.baseX += xAxis * speed * 0.1;
                particle.baseY += yAxis * speed * 0.1;
            });
        });
    }
}


function initParticles() {
    const authOverlay = document.getElementById('authOverlay');
    const particleCanvas = document.getElementById('particleCanvas');
    
    if (authOverlay && authOverlay.style.display !== 'none' && particleCanvas) {

        const ctx = particleCanvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        }

        new ParticleBackground('particleCanvas');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initParticles();
});
