const _PRG = document.getElementById('progress_loader');
const _OUT = document.querySelector('[for=progress_loader]');
let K = 5;
let tMax = K * _PRG.max;

function sleep(ms, f) {
    return (
        setTimeout(f, ms)
    )
}

function load(t = 0) {

    if (t <= tMax) {

        if (t % K === 0) _OUT.value = _PRG.value = t / K;
        requestAnimationFrame(load.bind(this, t + 5))
    }
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('container').style.display = 'none';
}

function successLoad() {
    document.getElementById('img__complete').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
    document.getElementById('container').style.display = 'none';
}

function errorLogIn() {
    document.getElementById('img__error').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
    document.getElementById('container').style.display = 'none';
}