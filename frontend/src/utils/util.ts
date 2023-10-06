export function changeStateListValue(list: any[], oldValue: any, newValue: any) {
    return list.map((obj) => (obj === oldValue ? newValue : obj));
}
