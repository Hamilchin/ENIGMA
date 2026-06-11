/*global levels: true*/
/*global Curve, Block, Level*/

levels = [
	//Level 1-5: introduction
	//Level 1: only walking
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 200, y: 630, xc: 100, yc: 630},
			{x: 400, y: 600, xc: 300},
			{x: 800, y: 580, xc: 500},
			{x: 1200, y: 500, xc: 900},
			{x: 1500, y: 400, xc: 1400},
			{x: 1600, y: 600, xc: 1510},
			{x: 1800, y: 600, xc: 1700},
			{x: 2700, y: 600}
		]),
		[
			new Block(
				new Curve([{x: 1500, y: 400}, {x: 1900, y: 400}]),
				new Curve([{x: 1500, y: 480}, {x: 1900, y: 480}]),
				1
			),
			new Block(
				new Curve([{x: 1800, y: 430}, {x: 1830, y: 430}]),
				new Curve([{x: 1800, y: 630}, {x: 1830, y: 630}]),
				1
			),
			new Block(
				new Curve([{x: 1615, y: 630}, {x: 1785, y: 630}]),
				new Curve([{x: 1615, y: 670}, {x: 1785, y: 670, xc: 1697, yc: 850}]),
				3
			)
		],
		[],
		[600]
	), 'Use ←/→ or A/D to move.'],
	//Level 2: simple jumps
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 200, y: 630, xc: 50, yc: 600},
			{x: 400, y: 620, xc: 350},
			{x: 800, y: 580, xc: 450},
			{x: 1250, y: 500},
			{x: 1400, y: 550, xc: 1300, yc: 480},
			{x: 3300, y: 600, xc: 1600}
		]),
		[
			new Block(
				new Curve([{x: 800, y: 550}, {x: 950, y: 550}]),
				new Curve([{x: 800, y: 620}, {x: 950, y: 620}]),
				1
			),
			new Block(
				new Curve([{x: 1400, y: 380}, {x: 1850, y: 360, xc: 1600, yc: 350}]),
				new Curve([{x: 1400, y: 450}, {x: 1850, y: 450}]),
				0
			),
			new Block(
				new Curve([{x: 2000, y: 230}, {x: 2500, y: 230}]),
				new Curve([{x: 2000, y: 290}, {x: 2500, y: 290}]),
				1
			),
			new Block(
				new Curve([{x: 2050, y: 240}, {x: 2070, y: 240}]),
				new Curve([{x: 2050, y: 730}, {x: 2070, y: 730}]),
				1
			),
			new Block(
				new Curve([{x: 2430, y: 240}, {x: 2450, y: 240}]),
				new Curve([{x: 2430, y: 730}, {x: 2450, y: 730}]),
				1
			),
			new Block(
				new Curve([{x: 2600, y: 430}, {x: 2800, y: 430}]),
				new Curve([{x: 2600, y: 490}, {x: 2800, y: 490}]),
				1
			)
		]
	), 'Use ↑ or W or Space to jump.'],
	//Level 3: first deadly obstacles
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 200, y: 640},
			{x: 400, y: 610, xc: 300, yc: 620},
			{x: 800, y: 580, xc: 600},
			{x: 1200, y: 500, xc: 1000},
			{x: 1400, y: 600, xc: 1250},
			{x: 1401, y: 650},
			{x: 1499, y: 650},
			{x: 1500, y: 600},
			{x: 2000, y: 600},
			{x: 2001, y: 620},
			{x: 2999, y: 620},
			{x: 3000, y: 600},
			{x: 3600, y: 590}
		]),
		[
			new Block(
				new Curve([{x: 600, y: 570}, {x: 800, y: 570, xc: 750, yc: 520}]),
				new Curve([{x: 600, y: 620}, {x: 800, y: 620, xc: 700, yc: 650}]),
				2
			),
			new Block(
				new Curve([{x: 1400, y: 600}, {x: 1500, y: 600}]),
				new Curve([{x: 1400, y: 700}, {x: 1500, y: 700, xc: 1450, yc: 800}]),
				3
			),
			new Block(
				new Curve([{x: 2000, y: 600}, {x: 3000, y: 600}]),
				new Curve([{x: 2000, y: 650}, {x: 3000, y: 650, xc: 2500, yc: 700}]),
				3
			),
			new Block(
				new Curve([{x: 2200, y: 400}, {x: 2700, y: 400, xc: 2450, yc: 350}]),
				new Curve([{x: 2200, y: 480}, {x: 2700, y: 480, xc: 2450, yc: 500}]),
				0
			),
			new Block(
				new Curve([{x: 2400, y: 370}, {x: 2500, y: 370, xc: 2450, yc: 320}]),
				new Curve([{x: 2400, y: 420}, {x: 2500, y: 420}]),
				2
			)
		]
	), 'Be careful!', [2, 3]],
	//Level 4: more complex jumps
	[new Level(
		new Curve([
			{x: 0, y: 550},
			{x: 200, y: 600, xc: 100, yc: 580},
			{x: 400, y: 570, xc: 250},
			{x: 1000, y: 600, xc: 600},
			{x: 1700, y: 600, xc: 1400}
		]),
		[
			new Block(
				new Curve([{x: 700, y: 250}, {x: 900, y: 250, xc: 800, yc: 200}]),
				new Curve([{x: 700, y: 630}, {x: 900, y: 630}]),
				1
			)
		]
	), 'To climb a wall jump against it, then jump again.'],
	//Level 5: drones
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 3600, y: 600, xc: 1800, yc: 400}
		]),
		[],
		[
			[900, 1700, 0.08],
			[1800, 3000, 0.12]
		],
		[1100, 2800]
	), 'Watch out for drones!', [1]],
	//more levels
	//walk above thorns
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 3600, y: 600, xc: 1800, yc: 495}
		]),
		[
			new Block(
				new Curve([{x: 600, y: 550}, {x: 3000, y: 550}]),
				new Curve([{x: 600, y: 650}, {x: 3000, y: 650}]),
				2
			),
			new Block(
				new Curve([{x: 0, y: 350}, {x: 300, y: 400}]),
				new Curve([{x: 0, y: 450}, {x: 300, y: 500}]),
				0
			),
			new Block(
				new Curve([{x: 600, y: 200}, {x: 1600, y: 200}]),
				new Curve([{x: 600, y: 280}, {x: 1600, y: 280}]),
				1
			),
			new Block(
				new Curve([{x: 2000, y: 200}, {x: 3000, y: 200}]),
				new Curve([{x: 2000, y: 280}, {x: 3000, y: 280}]),
				1
			)
		]
	)],
	//drones and thorns
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 1000, y: 600, xc: 500, yc: 650},
			{x: 2000, y: 600, xc: 1500},
			{x: 3000, y: 600, xc: 2500}
		]),
		[
			new Block(
				new Curve([{x: 600, y: 600}, {x: 700, y: 600, xc: 650, yc: 580}]),
				new Curve([{x: 600, y: 650}, {x: 700, y: 650}]),
				2
			),
			new Block(
				new Curve([{x: 1000, y: 570}, {x: 1100, y: 570, xc: 1050, yc: 550}]),
				new Curve([{x: 1000, y: 620}, {x: 1100, y: 620}]),
				2
			),
			new Block(
				new Curve([{x: 1400, y: 560}, {x: 1500, y: 560, xc: 1450, yc: 540}]),
				new Curve([{x: 1400, y: 610}, {x: 1500, y: 610}]),
				2
			),
			new Block(
				new Curve([{x: 1800, y: 570}, {x: 1900, y: 570, xc: 1850, yc: 550}]),
				new Curve([{x: 1800, y: 620}, {x: 1900, y: 620}]),
				2
			),
			new Block(
				new Curve([{x: 2200, y: 600}, {x: 2300, y: 600, xc: 2250, yc: 580}]),
				new Curve([{x: 2200, y: 650}, {x: 2300, y: 650}]),
				2
			),
			new Block(
				new Curve([{x: 2600, y: 600}, {x: 2700, y: 600, xc: 2650, yc: 580}]),
				new Curve([{x: 2600, y: 650}, {x: 2700, y: 650}]),
				2
			)
		],
		[[500, 1200], [1600, 2500], [1750, 2650]],
		[850, 2050]
	)],
	//platforms over water
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 300, y: 600},
			{x: 301, y: 620},
			{x: 2999, y: 620},
			{x: 3000, y: 600},
			{x: 3500, y: 600}
		]),
		[
			new Block(
				new Curve([{x: 300, y: 600}, {x: 3000, y: 600}]),
				new Curve([{x: 300, y: 650}, {x: 3000, y: 650, xc: 1650, yc: 700}]),
				3
			),
			new Block(
				new Curve([{x: 400, y: 500}, {x: 700, y: 500}]),
				new Curve([{x: 400, y: 550}, {x: 700, y: 550, xc: 550, yc: 600}]),
				0
			),
			new Block(
				new Curve([{x: 900, y: 350}, {x: 1150, y: 350}]),
				new Curve([{x: 900, y: 450}, {x: 1150, y: 450}]),
				1
			),
			new Block(
				new Curve([{x: 1400, y: 200}, {x: 1600, y: 200, xc: 1500, yc: 180}]),
				new Curve([{x: 1400, y: 300}, {x: 1600, y: 300, xc: 1500, yc: 350}]),
				0
			),
			new Block(
				new Curve([{x: 1750, y: 150}, {x: 1850, y: 150, xc: 1800, yc: 100}]),
				new Curve([{x: 1750, y: 180}, {x: 1850, y: 180, xc: 1800, yc: 230}]),
				2
			),
			new Block(
				new Curve([{x: 1750, y: 0}, {x: 1850, y: 0, xc: 1800, yc: -50}]),
				new Curve([{x: 1750, y: 30}, {x: 1850, y: 30, xc: 1800, yc: 80}]),
				2
			),
			new Block(
				new Curve([{x: 1850, y: 500}, {x: 2000, y: 500}]),
				new Curve([{x: 1850, y: 600}, {x: 2000, y: 600}]),
				1
			),
			new Block(
				new Curve([{x: 2100, y: 250}, {x: 2400, y: 200, xc: 2300, yc: 200}]),
				new Curve([{x: 2100, y: 450}, {x: 2400, y: 450}]),
				0
			)
		]
	)],
	//long jumps and a drone
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 260, y: 600},
			{x: 261, y: 620},
			{x: 799, y: 620},
			{x: 800, y: 600},
			{x: 1300, y: 600},
			{x: 1301, y: 620},
			{x: 1799, y: 620},
			{x: 1800, y: 600},
			{x: 2300, y: 600},
			{x: 2301, y: 620},
			{x: 2839, y: 620},
			{x: 2840, y: 600},
			{x: 3300, y: 600}
		]),
		[
			new Block(
				new Curve([{x: 260, y: 600}, {x: 800, y: 600}]),
				new Curve([{x: 260, y: 650}, {x: 800, y: 650, xc: 530, yc: 700}]),
				3
			),
			new Block(
				new Curve([{x: 1300, y: 600}, {x: 1800, y: 600}]),
				new Curve([{x: 1300, y: 650}, {x: 1800, y: 650, xc: 1550, yc: 700}]),
				3
			),
			new Block(
				new Curve([{x: 2300, y: 600}, {x: 2840, y: 600}]),
				new Curve([{x: 2300, y: 650}, {x: 2840, y: 650, xc: 2570, yc: 700}]),
				3
			)
		],
		[[1100, 2000]],
		[1100, 2000]
	)],
	//jumps below thorns
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 1000, y: 600, xc: 500, yc: 650},
			{x: 1800, y: 600, xc: 1500},
			{x: 2000, y: 600},
			{x: 2001, y: 630},
			{x: 2199, y: 630},
			{x: 2200, y: 600},
			{x: 2350, y: 600},
			{x: 2351, y: 630},
			{x: 2499, y: 630},
			{x: 2500, y: 600},
			{x: 3000, y: 600}
		]),
		[
			new Block(
				new Curve([{x: 850, y: 500}, {x: 1050, y: 500, xc: 950, yc: 450}]),
				new Curve([{x: 850, y: 630}, {x: 1050, y: 630}]),
				2
			),
			new Block(
				new Curve([{x: 850, y: 200}, {x: 1050, y: 200}]),
				new Curve([{x: 850, y: 350}, {x: 1050, y: 350, xc: 950, yc: 300}]),
				2
			),
			new Block(
				new Curve([{x: 1450, y: 400}, {x: 1500, y: 400}]),
				new Curve([{x: 1450, y: 600}, {x: 1500, y: 600}]),
				2
			),
			new Block(
				new Curve([{x: 1450, y: 120}, {x: 1500, y: 120}]),
				new Curve([{x: 1450, y: 270}, {x: 1500, y: 270}]),
				2
			),
			new Block(
				new Curve([{x: 2000, y: 600}, {x: 2200, y: 600}]),
				new Curve([{x: 2000, y: 670}, {x: 2200, y: 670, xc: 2100, yc: 690}]),
				3
			),
			new Block(
				new Curve([{x: 2350, y: 600}, {x: 2500, y: 600}]),
				new Curve([{x: 2350, y: 670}, {x: 2500, y: 670, xc: 2425, yc: 690}]),
				3
			),
			new Block(
				new Curve([{x: 2050, y: 300}, {x: 2450, y: 300, xc: 2250, yc: 280}]),
				new Curve([{x: 2050, y: 400}, {x: 2450, y: 400, xc: 2250, yc: 420}]),
				2
			)
		]
	)],
	//many drones
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 3600, y: 600, xc: 1800, yc: 500}
		]),
		[],
		[
			[-500, 500, 0.05],
			[300, 1000],
			[600, 1300, 0.12],
			[900, 2400],
			[1400, 2800],
			[1600, 3000, 0.12],
			[2200, 3400, 0.09],
			[3000, 3700, 0.2]
		],
		[800, 2000, 2800]
	)],
	//many platforms
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 1000, y: 600, xc: 500, yc: 550},
			{x: 2000, y: 600, xc: 1500},
			{x: 3000, y: 600, xc: 2500},
			{x: 4000, y: 600, xc: 3500},
			{x: 5000, y: 600, xc: 4500}
		]),
		[
			new Block(
				new Curve([{x: 350, y: 450}, {x: 550, y: 450, xc: 450, yc: 430}]),
				new Curve([{x: 350, y: 520}, {x: 550, y: 520, xc: 450, yc: 550}]),
				0
			),
			new Block(
				new Curve([{x: 750, y: 250}, {x: 950, y: 250, xc: 850, yc: 230}]),
				new Curve([{x: 750, y: 320}, {x: 950, y: 320, xc: 850, yc: 350}]),
				0
			),
			new Block(
				new Curve([{x: 1250, y: 150}, {x: 1450, y: 150, xc: 1350, yc: 130}]),
				new Curve([{x: 1250, y: 220}, {x: 1450, y: 220, xc: 1350, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 1750, y: 150}, {x: 1950, y: 150, xc: 1850, yc: 130}]),
				new Curve([{x: 1750, y: 220}, {x: 1950, y: 220, xc: 1850, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 2350, y: 150}, {x: 2550, y: 150, xc: 2450, yc: 130}]),
				new Curve([{x: 2350, y: 220}, {x: 2550, y: 220, xc: 2450, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 2850, y: 150}, {x: 3000, y: 150, xc: 2925, yc: 130}]),
				new Curve([{x: 2850, y: 220}, {x: 3000, y: 220, xc: 2925, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 3350, y: 150}, {x: 3500, y: 150, xc: 3425, yc: 130}]),
				new Curve([{x: 3350, y: 220}, {x: 3500, y: 220, xc: 3425, yc: 250}]),
				0
			),
			new Block(
				new Curve([{x: 3600, y: 200}, {x: 3700, y: 200}]),
				new Curve([{x: 3600, y: 650}, {x: 3700, y: 650}]),
				2
			)
		]
	)],
	//a chasing drone
	[new Level(
		new Curve([
			{x: 0, y: 600},
			{x: 1000, y: 600, xc: 500, yc: 550},
			{x: 2000, y: 600, xc: 1500},
			{x: 3000, y: 600, xc: 2500},
			{x: 4000, y: 600, xc: 3500},
			{x: 5000, y: 600, xc: 4500}
		]),
		[
			new Block(
				new Curve([{x: 600, y: 450}, {x: 650, y: 450}]),
				new Curve([{x: 600, y: 650}, {x: 650, y: 650}]),
				1
			),
			new Block(
				new Curve([{x: 1150, y: 590}, {x: 1330, y: 600}]),
				new Curve([{x: 1150, y: 640}, {x: 1330, y: 650}]),
				2
			),
			new Block(
				new Curve([{x: 1900, y: 450}, {x: 2000, y: 450}]),
				new Curve([{x: 1900, y: 650}, {x: 2000, y: 650}]),
				1
			),
			new Block(
				new Curve([{x: 2500, y: 550}, {x: 2700, y: 550}]),
				new Curve([{x: 2500, y: 600}, {x: 2700, y: 600}]),
				2
			),
			new Block(
				new Curve([{x: 3500, y: 450}, {x: 3550, y: 450}]),
				new Curve([{x: 3500, y: 670}, {x: 3550, y: 670}]),
				1
			),
			new Block(
				new Curve([{x: 4100, y: 560}, {x: 4300, y: 550}]),
				new Curve([{x: 4100, y: 610}, {x: 4300, y: 600}]),
				2
			)
		],
		[[-400, 5000, 0.195]]
	), 'RUN!']
];