function unipolarNRZ(data) {
    return data.map(bit => (bit === '1' ? 1 : 0));
}

function polarNRZ(data) {
    return data.map(bit => (bit === '1' ? 1 : -1));
}

function polarRZ(data) {
    return data.flatMap(bit => (bit === '1' ? [1, 0] : [-1, 0]));
}

function bipolarAMI(data) {
    let lastLevel = -1;
    return data.map(bit => {
        if (bit === '1') {
            lastLevel = -lastLevel;
            return lastLevel;
        }
        return 0;
    });
}

function manchester(data) {
    return data.flatMap(bit => (bit === '1' ? [1, -1] : [-1, 1]));
}

function pseudoternary(data) {
    let lastLevel = -1;
    return data.map(bit => {
        if (bit === '0') {
            lastLevel = -lastLevel;
            return lastLevel;
        }
        return 0;
    });
}

function polarNRZI(data) {
    let lastLevel = -1;
    return data.map(bit => {
        if (bit === '1') {
            lastLevel = -lastLevel;
        }
        return lastLevel;
    });
}

function differentialManchester(data) {
    let last = 1;
    let encoded = [];

    data.forEach(bit => {
        if (bit === '0') {
            last = -last;
        }
        encoded.push(last);
        encoded.push(-last);
    });
    return encoded;
}

function multilevel2B1Q(data) {
    const transitionTable = {
        '+': { '00': +1, '01': +3, '10': -1, '11': -3 },
        '-': { '00': -1, '01': -3, '10': +1, '11': +3 }
    };
    let result = [];
    let prevLevel = +1;

    for (let i = 0; i < data.length; i += 2) {
        const bits = data[i] + (data[i + 1] || '0'); 
        const polarity = prevLevel >= 0 ? '+' : '-';
        const nextLevel = transitionTable[polarity][bits];
        result.push(nextLevel);
        prevLevel = nextLevel;
    }

    return result;
}


function mlt3(data) {
    const levels = [0, 1, 0, -1]; 
    let result = [];
    let current = 0;
    let stateIndex = 0;

    data.forEach(bit => {
        if (bit === '1') {
            stateIndex = (stateIndex + 1) % 4;
        }
        current = levels[stateIndex];
        result.push(current);
    });
    return result;
}

function drawVisualization(encodedData, scheme) {
    const canvas = document.getElementById('visualization');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const mid = height / 2;
    const bitWidth = width / encodedData.length;

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(width, mid);
    ctx.strokeStyle = '#888';
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    let x = 0;
    let y = mid;

    function getY(level) {
        if (level === 3) return mid - 75;
        if (level === 1) return mid - 25;
        if (level === 0) return mid;
        if (level === -1) return mid + 25;
        if (level === -3) return mid + 75;
        return mid;
    }

    let currentLevel = getY(encodedData[0]);
    ctx.moveTo(x, currentLevel);

    for (let i = 0; i < encodedData.length; i++) {
        const level = encodedData[i];
        const targetY = getY(level);

        if (targetY !== currentLevel) {
            ctx.lineTo(x, targetY);
            currentLevel = targetY;
        }

        x += bitWidth;
        ctx.lineTo(x, currentLevel);
    }

    ctx.stroke();
}

document.getElementById('encodeButton').addEventListener('click', function () {
    const binaryInput = document.getElementById('binaryInput').value.trim();
    const encodingScheme = document.getElementById('encodingScheme').value;

    if (!/^[01]+$/.test(binaryInput)) {
        document.getElementById('result').innerText = 'Please enter valid binary data (only 0s and 1s).';
        return;
    }

    const data = binaryInput.split('');

    let encodedResult = [];
    switch (encodingScheme) {
        case 'unipolarNRZ':
            encodedResult = unipolarNRZ(data);
            break;
        case 'polarNRZ':
            encodedResult = polarNRZ(data);
            break;
        case 'polarRZ':
            encodedResult = polarRZ(data);
            break;
        case 'bipolarAMI':
            encodedResult = bipolarAMI(data);
            break;
        case 'manchester':
            encodedResult = manchester(data);
            break;
        case 'pseudoternary':
            encodedResult = pseudoternary(data);
            break;
        case 'polarNRZI':
            encodedResult = polarNRZI(data);
            break;
        case 'differentialManchester':
            encodedResult = differentialManchester(data);
            break;
        case '2b1q':
            encodedResult = multilevel2B1Q(data);
            break;
        case '8b6t':
            encodedResult = fake8B6T(data);
            break;
        case 'mlt3':
            encodedResult = mlt3(data);
            break;
        default:
            document.getElementById('result').innerText = 'Invalid encoding scheme.';
            return;
    }

    document.getElementById('result').innerText = `Encoded Result: ${encodedResult.join(' ')}`;
    drawVisualization(encodedResult, encodingScheme);
});
