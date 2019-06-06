export class Pagination<T> {
    totalPages: number = 0;
    totalRegs: number = 0;

    data: T[];

    constructor(public pageSize: number, public pageNumber: number) {

    }

}