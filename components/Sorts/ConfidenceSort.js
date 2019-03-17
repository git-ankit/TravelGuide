
export function confidenceSort(pos, n){
    var z, phat;
    z = 1.96;
    phat = 1 * pos / n;
    return (phat + z * z / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / (1 + z * z / n);
}



