const level1 = {
  startX: 1,
  startY: 1,
  b: [
    [-1, 0, 12, 1, true],
    [15, 3, 11, 1, false],
    [30, 5, 11, 1, true],
  ],
  end: [37, 6],
  treat: [32, 6],
};

const level2 = {
  startX: 1,
  startY: 7,
  b: [
    [-1, 6, 8, 1, true],
    [-1, 0, 8, 1, false],
    [13, 0, 1, 1, true],
    [6, 3, 1, 3, false],
    [11, 7, 4, 1, false],
    [18, 0, 15, 1, false],
    [30, 3, 1, 16, false],
    [37, 3, 3, 1, true],
    [31, 7, 3, 1, false],
    [37, 11, 3, 1, true],
    [31, 15, 3, 1, false],
    [37, 18, 3, 1, true],
    [27, 16, 3, 1, false],
    [18, 16, 5, 1, true],
    [8, 16, 5, 1, false],
    [-1, 18, 5, 1, true],
  ],
  end: [1, 19],
  treat: [1, 1, false],
};

const level3 = {
  startX: 36,
  startY: 19,
  isStartLeft: true,
  b: [
    [35, 18, 6, 1, true],
    [27, 17, 3, 1, false],
    [20, 16, 4, 1, true],
    [19, 17, 1, 2, true],
    [19, 19, 1, 1, false],
    [13, 21, 3, 1, false],
    [6, 16, 4, 1, true],
    [6, 17, 1, 20, true],
    [5, 17, 1, 2, false],
    [5, 8, 1, 2, true],
    [6, 7, 1, 1, true],
    [7, 0, 1, 16, true],
    [1, 4, 1, 1, false],
    [-1, 0, 8, 1, true],
  ],
  end: [1, 1],
  treat: [6, 8],
};

const level4 = {
  startX: 37,
  startY: 1,
  isStartLeft: true,
  b: [
    [32, 0, 8, 1, true],
    [27, 3, 1, 1, false],
    [20, 5, 1, 1, true],
    [19, 1, 2, 1, false],
    [8, 0, 5, 1, true],
    [8, 1, 1, 3, true],
    [4, 0, 4, 1, false],
    [11, 4, 1, 4, false],
    [15, 10, 8, 1, true],
    [9, 14, 4, 1, false],
    [25, 11, 1, 1, false],
    [28, 13, 1, 1, true],
    [31, 15, 1, 1, false],
    [36, 17, 4, 1, true],
    [-1, 18, 7, 1, true],
  ],
  end: [37, 18],
  treat: [1, 19],
};

const level5 = {
  startX: 1,
  startY: 18,
  b: [
    [-1, 17, 4, 1, true],
    [6, 7, 1, 40, false],
    [7, 5, 1, 40, true],
    [-1, 0, 7, 1, false],
    [9, 0, 3, 1, true],
    [8, 4, 1, 1, false],
    [10, 8, 1, 1, true],
    [12, 12, 1, 1, false],
    [16, 5, 1, 1, true],
    [21, 5, 5, 1, false],
    [25, 6, 1, 3, false],
    [26, 12, 1, 1, true],
    [25, 16, 1, 1, false],
    [18, 17, 1, 1, true],
    [8, 18, 4, 1, false],

    [29, 5, 3, 1, true],
    [33, 0, 8, 1, false],
  ],
  end: [37, 1],
  treat: [9, 19, false],
};

export default [level1, level2, level3, level4, level5];
