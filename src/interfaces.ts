export interface Player {
	velocity: vmath.vector3;
	direction: number;
	grounded: boolean;
	animation: string;
	correction: vmath.vector3;
}

export interface Action {
	pressed: boolean;
	released: boolean;
	repeated: boolean;
}

export interface Direction {
	left: number;
	right: number;
}

export interface Message {
	other_group: hash;
	normal: vmath.vector3;
	distance: number;
}