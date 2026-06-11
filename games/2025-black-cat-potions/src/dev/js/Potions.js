'use strict';


js13k.Potion = {

	// Starter ingredients available

	Water: {
		ingredients: [],
		desc: [
			'Just a water, please',
			"I'm thirsty",
		],
	},

	WarmingPotion: {
		ingredients: [js13k.IngredientWarm],
		desc: [
			'Something to warm me up',
			'I feel so cold',
		],
	},

	CoolingPotion: {
		ingredients: [js13k.IngredientCold],
		desc: [
			"Ugh, it's so hot!",
			'I need to cool down',
		],
		get alternatives() {
			return [js13k.Potion.Water];
		},
	},

	ColdWithHot: {
		ingredients: [
			js13k.IngredientWarm,
			js13k.IngredientCold,
		],
		desc: [
			'A cold drink with hot fruits',
		],
	},

	// Ingredient Life added

	HealthDrink: {
		ingredients: [js13k.IngredientLife],
		desc: [
			'I feel sick...',
			'A witchy herbal tee, please'
		],
		get alternatives() {
			return [js13k.Potion.FruitTea];
		},
	},

	RefreshingEnergizer: {
		ingredients: [
			js13k.IngredientCold,
			js13k.IngredientLife,
		],
		desc: [
			'Just finished workout. Got\nsome refreshing energizer?',
			'Do you have a cold\nand healthy drink?',
		],
	},

	FruitTea: {
		ingredients: [
			js13k.IngredientWarm,
			js13k.IngredientLife,
		],
		desc: [
			'A health potion, but can\nyou make it tasty?',
		],
	},

	ColdWarmHealthy: {
		ingredients: [
			js13k.IngredientCold,
			js13k.IngredientWarm,
			js13k.IngredientLife,
		],
		desc: [
			'Berries and herbs on ice.',
			'Herbs with berries on ice.',
		],
	},

	// Ingredient Emotion added

	CalmingPotion: {
		ingredients: [
			js13k.IngredientEmotion,
			js13k.IngredientCold,
		],
		desc: [
			'I need something to calm me down.\nTo help me think straight again.',
			'My fiery temper gets in my way',
		],
		get alternatives() {
			return [js13k.Potion.TeeAndBlanketPotion];
		},
	},

	MeditativePotion: {
		ingredients: [
			js13k.IngredientEmotion,
			js13k.IngredientLife,
		],
		desc: [
			'I have this mental fog...',
		],
	},

	TeeAndBlanketPotion: {
		ingredients: [
			js13k.IngredientEmotion,
			js13k.IngredientWarm,
		],
		desc: [
			'I had a really bad day...',
			'Can you bottle the feeling of\nwrapping yourself in a blanket?',
		],
		get alternatives() {
			return [
				js13k.Potion.MeditativePotion,
				js13k.Potion.WarmHealHead,
			];
		},
	},

	WarmHealHead: {
		ingredients: [
			js13k.IngredientEmotion,
			js13k.IngredientLife,
			js13k.IngredientWarm,
		],
		desc: [
			'Warm and healing, but,\nlike, for the head',
		],
		get alternatives() {
			return [js13k.Potion.TeeAndBlanketPotion];
		},
	},

	AmplitudePotion: {
		ingredients: [
			js13k.IngredientEmotion,
			js13k.IngredientCold,
			js13k.IngredientWarm,
		],
		desc: [
			'My emotions feel so... flat.\nGive me some swings.',
			'Give me conflicting feelings.\nYou heard me.',
		],
	},

	HotPotPotion: {
		ingredients: [
			js13k.IngredientEmotion,
			js13k.IngredientCold,
			js13k.IngredientWarm,
			js13k.IngredientLife,
		],
		desc: [
			'Make it a hotpot: Throw\na bit of everything in.',
			'Make it shimmer in all\nthe colors you can!',
		],
	},

};