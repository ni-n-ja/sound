fft = function (n, v, inv) {
    inv = inv == null ? false : inv;

    let rad = (inv ? 2.0 : -2.0) * Math.PI / n;
    let cs = Math.cos(rad),
        sn = Math.sin(rad);

    for (let m = (n <<= 1), mh; 2 <= (mh = m >>> 1); m = mh) {
        for (let i = 0; i < n; i += m) {
            let j = i + mh;
            let ar = v[i + CR],
                ai = v[i + CI];
            let br = v[j + CR],
                bi = v[j + CI];
            v[i + CR] = ar + br;
            v[i + CI] = ai + bi;
            v[j + CR] = ar - br;
            v[j + CI] = ai - bi;
        }

        let wcs = cs,
            wsn = sn;
        for (let i = 2; i < mh; i += 2) {
            for (let j = i; j < n; j += m) {
                let k = j + mh;
                let ar = v[j + CR],
                    ai = v[j + CI];
                let br = v[k + CR],
                    bi = v[k + CI];
                v[j + CR] = ar + br;
                v[j + CI] = ai + bi;
                let xr = ar - br;
                let xi = ai - bi;
                v[k + CR] = xr * wcs - xi * wsn;
                v[k + CI] = xr * wsn + xi * wcs;
            }
            let tcs = wcs * cs - wsn * sn;
            wsn = wcs * sn + wsn * cs;
            wcs = tcs;
        }
        let tcs = cs * cs - sn * sn;
        sn = 2.0 * (cs * sn);
        cs = tcs;
    }

    let m = n >>> 1;
    let m2 = m + 2;
    let mh = n >>> 2;

    for (let i = 0, j = 0; i < m; i += 4) {
        swap(v, i + m, j + 2);
        if (i < j) {
            swap(v, i + m2, j + m2);
            swap(v, i, j);
        }
        for (let k = mh;
            (j ^= k) < k; k >>= 1) {}
    }

    if (inv) {
        for (let i = 0; i < n; ++i) {
            v[i] /= n;
        }
    }
};

fft(0, 0, false);