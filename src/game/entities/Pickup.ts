import { Container, Graphics } from 'pixi.js';

export type PickupType = 'MULTIPLIER' | 'WARP';

export class Pickup {
  public id: number;
  public type: PickupType;
  public x: number;
  public y: number;
  public baseY: number;
  public hitRadius: number = 24;
  public container: Container;
  public isCollected: boolean = false;

  private graphics: Graphics;
  private time: number = Math.random() * Math.PI * 2;
  private rotationSpeed: number = 1.6;

  constructor(id: number, x: number, y: number, type: PickupType) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.baseY = y;

    this.container = new Container();
    this.container.label = `pickup-${id}-${type}`;
    this.container.position.set(this.x, this.y);

    this.graphics = new Graphics();
    this.container.addChild(this.graphics);

    this.render();
  }

  private render(): void {
    this.graphics.clear();

    if (this.type === 'MULTIPLIER') {
      // Golden / Champagne Amber Multiplier Core
      // 1. Soft celestial golden aura
      this.graphics
        .circle(0, 0, 19)
        .fill({ color: 0xdfb15b, alpha: 0.16 });

      this.graphics
        .circle(0, 0, 13)
        .fill({ color: 0xffd166, alpha: 0.28 });

      // 2. Shiny metallic octahedron/diamond crystal
      const sz = 10;
      this.graphics
        .poly([
          { x: 0, y: -sz * 1.2 },
          { x: sz, y: 0 },
          { x: 0, y: sz * 1.2 },
          { x: -sz, y: 0 }
        ])
        .fill({ color: 0x2b1d06, alpha: 0.95 })
        .stroke({ color: 0xdfb15b, width: 1.8, alpha: 0.95 });

      // Inner crystalline facet lines
      this.graphics
        .moveTo(0, -sz * 1.2)
        .lineTo(0, sz * 1.2)
        .stroke({ color: 0xfff8e7, width: 1.2, alpha: 0.7 });

      this.graphics
        .moveTo(-sz, 0)
        .lineTo(sz, 0)
        .stroke({ color: 0xfff8e7, width: 1.2, alpha: 0.7 });

      // 3. Specular diamond glint
      this.graphics
        .circle(-2.5, -3.5, 2)
        .fill({ color: 0xffffff, alpha: 0.95 });

      this.graphics
        .circle(0, 0, 2.5)
        .fill({ color: 0xfff8e7, alpha: 0.9 });

    } else {
      // Chain Warp Conduit (Pulsating Geometric Warp Node)
      // 1. Soft cosmic prismatic aura
      this.graphics
        .circle(0, 0, 21)
        .fill({ color: 0x89c2d9, alpha: 0.16 });

      this.graphics
        .circle(0, 0, 14)
        .fill({ color: 0xe0f2fe, alpha: 0.24 });

      // 2. Concentric geometric diamond ring
      const sz = 11;
      this.graphics
        .poly([
          { x: 0, y: -sz },
          { x: sz, y: 0 },
          { x: 0, y: sz },
          { x: -sz, y: 0 }
        ])
        .stroke({ color: 0xe0f2fe, width: 1.6, alpha: 0.9 });

      // Inner dense crystalline core
      this.graphics
        .poly([
          { x: -sz * 0.6, y: -sz * 0.6 },
          { x: sz * 0.6, y: -sz * 0.6 },
          { x: sz * 0.6, y: sz * 0.6 },
          { x: -sz * 0.6, y: sz * 0.6 }
        ])
        .fill({ color: 0x0f1c2e, alpha: 0.95 })
        .stroke({ color: 0x89c2d9, width: 1.4, alpha: 0.85 });

      // 3. Central singularity star glint
      this.graphics
        .circle(0, 0, 3)
        .fill({ color: 0xffffff, alpha: 0.95 });
    }
  }

  public update(dt: number): void {
    if (this.isCollected) return;

    this.time += dt * 3.5;
    // Gentle floating bobbing
    this.y = this.baseY + Math.sin(this.time) * 5;
    this.container.position.y = this.y;

    // Smooth crystalline rotation
    this.container.rotation += this.rotationSpeed * dt;
  }

  public checkCollision(px: number, py: number, playerRadius: number = 6.5): boolean {
    if (this.isCollected) return false;
    const dx = px - this.x;
    const dy = py - this.y;
    const hit = this.hitRadius + playerRadius;
    return dx * dx + dy * dy <= hit * hit;
  }

  public destroy(): void {
    this.container.destroy({ children: true });
  }
}

