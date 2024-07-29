async function loadData() {
    const data = await d3.csv("data/temperature.csv", d => {
        return {
            Year: parseSafe(d.Year),
            Jan: parseSafe(d.Jan),
            Feb: parseSafe(d.Feb),
            Mar: parseSafe(d.Mar),
            Apr: parseSafe(d.Apr),
            May: parseSafe(d.May),
            Jun: parseSafe(d.Jun),
            Jul: parseSafe(d.Jul),
            Aug: parseSafe(d.Aug),
            Sep: parseSafe(d.Sep),
            Oct: parseSafe(d.Oct),
            Nov: parseSafe(d.Nov),
            Dec: parseSafe(d.Dec),
            J_D: parseSafe(d['J-D']),
            D_N: parseSafe(d['D-N']),
            DJF: parseSafe(d['DJF']),
            MAM: parseSafe(d['MAM']),
            JJA: parseSafe(d['JJA']),
            SON: parseSafe(d['SON'])
        };
    });
    console.log(data);
    return data;
}

function parseSafe(value) {
    if (value === undefined || value.trim() === "***") {
        return NaN;
    }
    return parseFloat(value);
}