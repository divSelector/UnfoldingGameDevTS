import { Player, Action, Message } from "../interfaces";
import { DIRECTION } from "../constants";
import { vmath2 } from "../math";


const thisSprite = '#sprite'
const baseVelocity = 500;
const gravity = 1000;
const jumpTakeOff = 700;


export function init(this: Player) {
	msg.post("#", "acquire_input_focus");
	msg.post("@system:", "toggle_physics_debug");

	this.velocity = vmath.vector3(0,0,0);
	this.direction = 0;
	this.grounded = false;
	this.animation = "idle";
	this.correction = vmath.vector3(0,0,0);
}


export function on_input(this: Player, actionId: hash, action: Action) {

	const isKeyPressed = (key: string, hid: hash = actionId) => hid === hash(key);

	if (isKeyPressed('right')) {
		this.direction = DIRECTION.right;
		walk.call(this);
	} else if (isKeyPressed('left')) {
		this.direction = DIRECTION.left;
		walk.call(this);
	} else if (isKeyPressed("jump")) {
		if (action.pressed && this.grounded) {
			this.grounded = false;
			this.velocity.y += jumpTakeOff;
		}
	}

}


function handleCollision(this: Player, normal: vmath.vector3, distance: number) {

	if (distance > 0) {
		const projection = vmath.project(this.correction, vmath2.mul(normal,distance))
		if (projection < 1) {
			const compensation = (distance - distance * projection) * normal
			go.set_position(vmath2.add(go.get_position(), compensation));
			this.correction = vmath2.add(this.correction, compensation)
		}
	}

	if (Math.abs(normal) > 0) this.velocity.x = 0;

	// on the ground
	if (normal.y > 0) {
		this.grounded = true;
		this.velocity.y = 0;
	}

	// hitting ceiling
	if (normal.y < 0) {
		this.velocity.y = 0;
	}
}

// also has sender: url
export function on_message(this: Player, messageId: hash, message: Message) {

	if (messageId === hash("contact_point_response") && message.other_group === hash("level")) {
		handleCollision.call(this, message.normal, message.distance)
		pprint(message)
	}
}

export function fixed_update(this: Player, dt: number) {
	this.velocity.y = this.velocity.y - gravity * dt;
	this.velocity.y = clamp(this.velocity.y, -2000, 20000);

	if (this.grounded) this.velocity.y = 0;

	const position = go.get_position();
	position.x += this.velocity.x * dt;
	position.y += this.velocity.y * dt;


	go.set_position(position);

	animate.call(this);

	this.velocity.x = 0;
	this.grounded = false;
}

function walk(this: Player): void {
	this.velocity.x = baseVelocity * this.direction

	flip(this.direction);

}

function changeAnimation(this: Player, newAnimation: string) {
	if (this.animation !== newAnimation) {
		sprite.play_flipbook(thisSprite, newAnimation)
		this.animation = newAnimation
	}
}

function animate(this: Player) {

	if (this.grounded) {
		if (this.velocity.x === 0) {
			changeAnimation.call(this, "idle");
		} else {
			changeAnimation.call(this, "walk");
		}
	} else {
		changeAnimation.call(this, 'airborne');
	}

}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

const flip = (direction: number) => sprite.set_hflip(thisSprite, direction < 0);