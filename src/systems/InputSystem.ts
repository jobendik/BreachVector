import Phaser from 'phaser';

export class InputSystem {
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private primaryDownLastFrame = false;
  private secondaryDownLastFrame = false;
  private primaryPressed = false;
  private secondaryPressed = false;

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is required for Breach Vector.');
    }
    this.keys = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      dash: Phaser.Input.Keyboard.KeyCodes.SPACE,
      slow: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      reload: Phaser.Input.Keyboard.KeyCodes.R,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      melee: Phaser.Input.Keyboard.KeyCodes.F,
      pause: Phaser.Input.Keyboard.KeyCodes.ESC,
      debug: Phaser.Input.Keyboard.KeyCodes.TAB,
      debugAlt: Phaser.Input.Keyboard.KeyCodes.F1,
      weapon1: Phaser.Input.Keyboard.KeyCodes.ONE,
      weapon2: Phaser.Input.Keyboard.KeyCodes.TWO,
      weapon3: Phaser.Input.Keyboard.KeyCodes.THREE,
      weapon4: Phaser.Input.Keyboard.KeyCodes.FOUR
    }) as Record<string, Phaser.Input.Keyboard.Key>;

    scene.input.mouse?.disableContextMenu();
  }

  update(): void {
    const pointer = this.scene.input.activePointer;
    const primaryDown = pointer.leftButtonDown();
    const secondaryDown = pointer.rightButtonDown();
    this.primaryPressed = primaryDown && !this.primaryDownLastFrame;
    this.secondaryPressed = secondaryDown && !this.secondaryDownLastFrame;
    this.primaryDownLastFrame = primaryDown;
    this.secondaryDownLastFrame = secondaryDown;
  }

  movementVector(): Phaser.Math.Vector2 {
    const direction = new Phaser.Math.Vector2(0, 0);
    if (this.keys.up.isDown) direction.y -= 1;
    if (this.keys.down.isDown) direction.y += 1;
    if (this.keys.left.isDown) direction.x -= 1;
    if (this.keys.right.isDown) direction.x += 1;
    return direction.lengthSq() > 0 ? direction.normalize() : direction;
  }

  pointerWorld(camera: Phaser.Cameras.Scene2D.Camera): Phaser.Math.Vector2 {
    const point = this.scene.input.activePointer.positionToCamera(camera) as Phaser.Math.Vector2;
    return new Phaser.Math.Vector2(point.x, point.y);
  }

  primaryHeld(): boolean {
    return this.scene.input.activePointer.leftButtonDown();
  }

  consumePrimaryPressed(): boolean {
    return this.primaryPressed;
  }

  consumeSecondaryPressed(): boolean {
    return this.secondaryPressed;
  }

  slowWalkHeld(): boolean {
    return this.keys.slow.isDown;
  }

  interactHeld(): boolean {
    return this.keys.interact.isDown;
  }

  dashPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.dash);
  }

  reloadPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.reload);
  }

  meleePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.melee);
  }

  pausePressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.pause);
  }

  debugPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.debug) || Phaser.Input.Keyboard.JustDown(this.keys.debugAlt);
  }

  weaponPressed(): number | null {
    if (Phaser.Input.Keyboard.JustDown(this.keys.weapon1)) return 0;
    if (Phaser.Input.Keyboard.JustDown(this.keys.weapon2)) return 1;
    if (Phaser.Input.Keyboard.JustDown(this.keys.weapon3)) return 2;
    if (Phaser.Input.Keyboard.JustDown(this.keys.weapon4)) return 3;
    return null;
  }

  destroy(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) {
      return;
    }
    for (const key of Object.values(this.keys)) {
      keyboard.removeKey(key, true);
    }
  }
}
