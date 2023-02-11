const csv = require('csv-stream');
const fs = require('fs');

const source: string | null = process.argv[2] ?? null;

if (!source) {
    // TODO: throw a proper error
    console.error('node cli.js ./input.csv');
}

const calculate_dimension = (arr: number[]): number => Math.sqrt(arr.length);

const print_out_arr = (arr: number[]) => {
    const dimension = calculate_dimension(arr);

    for (let i = 0; i < dimension; i++) {
        console.log(
            arr.slice(
                i * dimension,
                i * dimension + dimension
            )
        );
    }
};

const calc_index = (
    row_index: number,
    column_index: number,
    dimension: number,
): number => (row_index * dimension) + column_index;

const calc_new_index = (
    array: number[],
    old_index: number,
    dimension: number,
    column_index: number,
    row_index: number,
): number => {

    // if item is in the center, its location will not be changed
    const item_is_centered: boolean = column_index === (dimension - 1) / 2 && row_index === (dimension - 1) / 2;
    if (item_is_centered) {
        return old_index;
    }

    const move_right = column_index >= row_index
        && column_index < dimension - 1 - row_index;

    const move_left = column_index <= row_index
        && column_index > dimension - 1 - row_index;

    const move_down = column_index >= dimension - 1 - row_index
        && row_index < column_index;

    const move_up = column_index < row_index
        && row_index <= dimension - 1 - column_index;


    if (move_right) {
        return calc_index(row_index, column_index + 1, dimension);
    }

    if (move_left) {
        return calc_index(row_index, column_index - 1, dimension);
    }

    if (move_up) {
        return calc_index(row_index - 1, column_index, dimension);
    }

    if (move_down) {
        return calc_index(row_index + 1, column_index, dimension);
    }

    // TODO: throw a proper error
    console.error("Didn't find an index for this element");

    return -1;
};


const options = {
    delimiter: ',',
    endLine: '\n',
    columns: ['id', 'json'],
    columnOffset: 1,
    escapeChar: '"',
    enclosedChar: '"'
};

const csvStream = csv.createStream(options);

fs.createReadStream(source).pipe(csvStream)
    .on('error', (err: any) => {
        console.error(err);
    })
    .on('data', (data: any) => {
        const array = JSON.parse(data.json);

        // const new_to_old_index_map: Map<number, number> = new Map();

        const dimension = calculate_dimension(array);
        const isValid = dimension % 1 === 0;

        if (!isValid) {
            console.log(`${data.id},"[]",${isValid}`);
            return;
        }

        const out = Array(array.length).fill(0);

        for (let old_index = 0; old_index < array.length; old_index++) {
            const column_index = old_index % dimension;
            const row_index = Math.floor(old_index / dimension);

            const new_index = calc_new_index(array, old_index, dimension, column_index, row_index);

            out[new_index] = array[old_index]
        }

        console.log(`${data.id},"[${out}]",${isValid}`);

        // console.log('--------------')
        // console.log('old:')
        // print_out_arr(array)
        // console.log('new:')
        // print_out_arr(new_array)
        // console.log('--------------')

    })