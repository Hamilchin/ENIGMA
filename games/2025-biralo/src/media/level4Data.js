// Auto generated via cli/images.build.js

export const LEVEL4DATA = [
    {
        "name": "background",
        "gridCellWidth": 8,
        "gridCellHeight": 8,
        "gridCellsX": 12,
        "gridCellsY": 12,
        "tileset": "tileset",
        "data": [
            1,
            2,
            2,
            1,
            4,
            1,
            4,
            12,
            13,
            13,
            14,
            12,
            2,
            -1,
            13,
            12,
            12,
            16,
            12,
            12,
            12,
            16,
            12,
            16,
            -1,
            -1,
            -1,
            2,
            25,
            3,
            24,
            0,
            28,
            4,
            28,
            12,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            3,
            12,
            -1,
            -1,
            -1,
            7,
            9,
            -1,
            -1,
            0,
            -1,
            -1,
            -1,
            13,
            18,
            18,
            22,
            16,
            22,
            -1,
            2,
            0,
            0,
            -1,
            -1,
            12,
            12,
            28,
            3,
            24,
            11,
            11,
            -1,
            -1,
            10,
            -1,
            -1,
            12,
            13,
            3,
            -1,
            2,
            17,
            23,
            15,
            21,
            22,
            -1,
            -1,
            12,
            16,
            -1,
            -1,
            -1,
            28,
            3,
            -1,
            0,
            27,
            -1,
            -1,
            13,
            12,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            12,
            13,
            -1,
            -1,
            -1,
            -1,
            8,
            2,
            -1,
            3,
            -1,
            -1,
            16,
            12,
            -1,
            14,
            12,
            12,
            21,
            11,
            11,
            5,
            14,
            12,
            16
        ]
    },
    {
        "name": "collision",
        "gridCellWidth": 8,
        "gridCellHeight": 8,
        "gridCellsX": 12,
        "gridCellsY": 12,
        "entities": [
            {
                "name": "platform",
                "id": 0,
                "x": 0,
                "y": 104,
                "width": 80,
                "height": 8
            },
            {
                "name": "platform",
                "id": 1,
                "x": -8,
                "y": -8,
                "width": 8,
                "height": 56
            },
            {
                "name": "platform",
                "id": 4,
                "x": 16,
                "y": 8,
                "width": 48,
                "height": 8
            },
            {
                "name": "platform",
                "id": 5,
                "x": 88,
                "y": 16,
                "width": 8,
                "height": 72
            },
            {
                "name": "platform",
                "id": 6,
                "x": 16,
                "y": 88,
                "width": 32,
                "height": 16
            },
            {
                "name": "platform",
                "id": 8,
                "x": 0,
                "y": 40,
                "width": 40,
                "height": 8
            },
            {
                "name": "platform",
                "id": 10,
                "x": 32,
                "y": 56,
                "width": 40,
                "height": 8
            },
            {
                "name": "platform",
                "id": 13,
                "x": 0,
                "y": 48,
                "width": 8,
                "height": 56
            },
            {
                "name": "platform",
                "id": 14,
                "x": 72,
                "y": 88,
                "width": 24,
                "height": 24
            }
        ]
    },
    {
        "name": "entities",
        "gridCellWidth": 8,
        "gridCellHeight": 8,
        "gridCellsX": 12,
        "gridCellsY": 12,
        "entities": [
            {
                "name": "player",
                "id": 10,
                "x": 0,
                "y": 32,
                "width": 8,
                "height": 8
            },
            {
                "name": "boulder",
                "id": 11,
                "x": 40,
                "y": -8,
                "width": 16,
                "height": 16,
                "values": {
                    "flipH": -1
                }
            },
            {
                "name": "totem",
                "id": 12,
                "x": 16,
                "y": 64,
                "width": 24,
                "height": 24,
                "values": {
                    "flipH": 1,
                    "attackTime": 3
                }
            },
            {
                "name": "torch",
                "id": 13,
                "x": 56,
                "y": 80,
                "width": 8,
                "height": 8
            },
            {
                "name": "hurt",
                "id": 14,
                "x": 48,
                "y": 88,
                "width": 24,
                "height": 16
            },
            {
                "name": "hurt",
                "id": 15,
                "x": 32,
                "y": 48,
                "width": 16,
                "height": 8
            },
            {
                "name": "exit",
                "id": 16,
                "x": 8,
                "y": 96,
                "width": 8,
                "height": 8
            }
        ]
    },
    {
        "name": "reversers",
        "gridCellWidth": 8,
        "gridCellHeight": 8,
        "gridCellsX": 12,
        "gridCellsY": 12,
        "entities": [
            {
                "name": "reverser",
                "id": 0,
                "x": 0,
                "y": 32,
                "width": 8,
                "height": 8,
                "values": {
                    "side": 1
                }
            },
            {
                "name": "reverser",
                "id": 1,
                "x": 48,
                "y": 48,
                "width": 8,
                "height": 8,
                "values": {
                    "side": 1
                }
            },
            {
                "name": "reverser",
                "id": 2,
                "x": 80,
                "y": 80,
                "width": 8,
                "height": 8,
                "values": {
                    "side": -1
                }
            }
        ]
    },
    {
        "name": "stoppers",
        "gridCellWidth": 8,
        "gridCellHeight": 8,
        "gridCellsX": 12,
        "gridCellsY": 12,
        "entities": [
            {
                "name": "stopper",
                "id": 0,
                "x": 56,
                "y": 96,
                "width": 8,
                "height": 8
            }
        ]
    },
    {
        "name": "triggers",
        "gridCellWidth": 8,
        "gridCellHeight": 8,
        "gridCellsX": 12,
        "gridCellsY": 12,
        "entities": [
            {
                "name": "trigger",
                "id": 0,
                "x": 8,
                "y": 16,
                "width": 8,
                "height": 24,
                "nodes": [
                    {
                        "x": 40,
                        "y": -8
                    }
                ],
                "values": {
                    "delay": 0
                }
            }
        ]
    }
];