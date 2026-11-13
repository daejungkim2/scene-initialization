# SFiD-Init

Project page for **Safety- and Fidelity-Regularized Diffusion for HD-Map-Conditioned Traffic Scene Initialization**.

**[Project page](https://daejungkim2.github.io/scene-initialization/)** · **[Additional LivingLab demos](https://daejungkim2.github.io/scene-initialization/livinglab.html)**

The page presents the manuscript overview, selected initialization examples, Pittsburgh results and rollouts with a shared Flow-ERD behavior model. The LivingLab page preserves the earlier qualitative demos.

## Local preview

This is a static HTML/CSS/JavaScript site; no build or package installation is required. From the repository directory, run:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Open <http://127.0.0.1:8765/>. Stop the server with Ctrl-C.

## Source layout

- `index.html`: main project page
- `livinglab.html`: archived LivingLab gallery
- `assets/`: styles, scripts, figures, videos and public result metadata

GitHub Pages serves the site from `main`. Asset paths are relative to support the `/scene-initialization/` project path.

## Contact

Dae Jung Kim · <daejung.kim@naverlabs.com>
