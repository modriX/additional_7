class Sudoku {
	constructor(matrix) {
		this.solved = [];
		this.steps = 0;
		this.init(matrix);
		this.solve();
	}

	getRes() {
		let matrix = [[], [], [], [], [], [], [], [], []];
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				matrix[i].push(this.solved[i][j][0]);
			}
		}
		return matrix;
	}

	init(matrix) {
		let suggest = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		for(let i = 0; i < 9; i++){
			this.solved[i] = [];
			for(let j = 0; j < 9; j++) {
				if (matrix[i][j] !== 0) {
					this.solved[i][j] = [matrix[i][j], 'in', []];
				}
				else {
					this.solved[i][j] = [0, 'unknown', suggest];
				}
			}
		}
	}

	solve() {
		let changed = 0;
		do {
			changed = this.upgradeSuggests();
			this.steps++;
			if (this.steps > 81) {
				break;
			}
		} while (changed);
		if (!this.isSolved() && !this.isFailed()) {
			this.backtracking();
		}
	}

	upgradeSuggests() {
		let changed = 0;
		let buf = Sudoku.arrayDiff(this.solved[1][3][2], this.rowContent(1));
		buf = Sudoku.arrayDiff(buf, this.colContent(3));
		buf = Sudoku.arrayDiff(buf, this.sectContent(1, 3));
		for(let i = 0; i < 9; i++){
			for(let j = 0; j < 9; j++) {
				if (this.solved[i][j][1] !== 'unknown') {
					continue;
				}
				changed += this.solveSingle(i, j);
				changed += this.solveHiddenSingle(i, j);
			}
		}
		return changed;
	}

	solveSingle(i, j) {
		this.solved[i][j][2] = Sudoku.arrayDiff(this.solved[i][j][2], this.rowContent(i));
        this.solved[i][j][2] = Sudoku.arrayDiff(this.solved[i][j][2], this.colContent(j));
        this.solved[i][j][2] = Sudoku.arrayDiff(this.solved[i][j][2], this.sectContent(i, j));
        if (this.solved[i][j][2].length === 1) {
        	this.markSolved(i, j, this.solved[i][j][2][0]);
            return 1;
        }
        return 0;
	}

	solveHiddenSingle(i, j) {
		let changed = 0;
		let less = this.lessRowSuggest(i, j);
		if (less.length === 1) {
			this.markSolved(i, j, less[0]);
            changed++;
		}
		less = this.lessColSuggest(i, j);
		if (less.length === 1) {
            this.markSolved(i, j, less[0]);
            changed++;
        }
        less = this.lessSectSuggest(i, j);
        if (less.length === 1) {
            this.markSolved(i, j, less[0]);
            changed++;
        }
        return changed;
	}

	markSolved(i, j, solve) {
		this.solved[i][j][0] = solve;
        this.solved[i][j][1] = 'solved';
	}

	rowContent(i) {
		let content =[];
		for (let j = 0; j < 9; j++){
			if (this.solved[i][j][1] !== 'unknown') {
				content[content.length] = this.solved[i][j][0];
			}
		}
		return content;
	}

	colContent(j) {
		let content =[];
		for (let i = 0; i < 9; i++){
			if (this.solved[i][j][1] !== 'unknown') {
				content[content.length] = this.solved[i][j][0];
			}
		}
		return content;
	}

	sectContent(i, j) {
		let content = [];
		let offset = Sudoku.sectOffset(i, j);
		for (let k = 0; k < 3; k++){
			for (let l = 0; l < 3; l++){
				if (this.solved[offset.i + k][offset.j + l][1] !== 'unknown') {
					content[content.length] = this.solved[offset.i+k][offset.j+l][0];
				}
			}
		}
		return content;
	}

	lessRowSuggest(i, j) {
		let less = this.solved[i][j][2];
		for (let k = 0; k < 9; k++) {
			if (k == j || this.solved[i][k][1] !== 'unknown') {
				continue;
			}
			less = Sudoku.arrayDiff(less, this.solved[i][k][2]);
		}
		return less;
	}

	lessColSuggest(i, j) {
		let less = this.solved[i][j][2];
		for (let k = 0; k < 9; k++) {
			if (k == i || this.solved[k][j][1] !== 'unknown') {
				continue;
			}
			less = Sudoku.arrayDiff(less, this.solved[k][j][2]);
		}
		return less;
	}

	lessSectSuggest(i, j) {
		let less = this.solved[i][j][2];
		let offset = Sudoku.sectOffset(i, j);
		for (let k = 0; k < 3; k++) {
			for (let l = 0; l < 3; l++) {
				if ((offset.i + k === i && offset.j + l === j) || this.solved[offset.i +k ][offset.j + l][1] !== 'unknown') {
					continue;
				}
				less = Sudoku.arrayDiff(less, this.solved[offset.i + k][offset.j + l][2]);
			}
		}
		return less;
	}

	static arrayDiff(arr1, arr2) {
		let diff = [];
		for (let i = 0; i < arr1.length; i++) {
			let isFound = false;
			for (let j = 0; j < arr2.length; j++) {
				if (arr1[i] === arr2[j]) {
					isFound = true;
					break;
				}
			}
			if (!isFound) {
				diff[diff.length] = arr1[i];
			}
		}
		return diff;
	}

	static arrayUnique(arr) {
		let sorter = {};
		for (let i = 0, j = arr.length; i < j; i++){
			sorter[arr[i]] = arr[i];
		}
		arr = [];
		for (let i in sorter){
			arr.push(i);
		}
		return arr;
	}

	static sectOffset(i, j) {
		return {
			j: Math.floor(j / 3) * 3,
			i: Math.floor(i / 3) * 3
		}
	};

	isSolved() {
		let s = true;
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.solved[i][j][1] === 'unknown') {
					s = false;
				}
			}
		}
		return s;
	}

	isFailed() {
		let f = false;
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.solved[i][j][1] === 'unknown' && !this.solved[i][j][2].length) {
					f = true;
				}
			}
		}
		return f;
	}

	backtracking() {
		let val = [[], [], [], [], [], [], [], [], []];
		let iMin = -1, jMin = -1, suggestCount = 0;
		for (let i = 0; i < 9; i++) {
			val[i].length = 9;
			for (let j = 0; j < 9; j++) {
				val[i][j] = this.solved[i][j][0];
				if (this.solved[i][j][1] === 'unknown' && (this.solved[i][j][2].length < suggestCount || !suggestCount)) {
					suggestCount = this.solved[i][j][2].length;
					iMin = i;
					jMin = j;
				}
			}
		}
		for (let k = 0; k < suggestCount; k++) {
			val[iMin][jMin] = this.solved[iMin][jMin][2][k];
			let sudoku = new Sudoku(val);
			if (sudoku.isSolved()) {
				let out = sudoku.solved;
				for (let i = 0; i < 9; i++) {
					for (let j = 0; j < 9; j++) {
						if (this.solved[i][j][1] === 'unknown') {
							this.markSolved(i, j, out[i][j][0]);
						}
					}
				}
				return;
			}
		}
	}
}

module.exports = function solveSudoku(matrix) {
  let sudoku = new Sudoku(matrix);
  return sudoku.getRes();
}

