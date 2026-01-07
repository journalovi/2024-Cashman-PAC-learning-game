# Probably Approximately Correct Learning: a machine learning game

An interactive article in the [Journal of Visualization and Interaction (JoVI)](https://journalovi.org/).

## Abstract

In this interactive article, we present an interactive game that represents the types of tasks solved by machine learning algorithms. We use this game to motivate the definition of Probably Approximately Correct (PAC) learning, illustrating a proof of PAC learnability for Empirical Risk Minimization (ERM). Then, we show three types of vulnerabilities of ERM that often occur in applied machine learning - domain mismatch, dependencies in data, and an incorrect model class. We conclude by arguing for the need for visualization to identify these issues in a modeling dataset.

Source code and any associated materials can be found on [OSF](https://osf.io/65gre/)..

## Repository

This repository is the codebase for a blog post designed to illustrate the challenges that machine learning algorithms encounter when trying to fit a dataset.  It is implemented in [idyll](https://idyll-lang.org/), a toolkit for creating data-driven stories and explorable explanations.  

It will be accessible at a public URL once it has been peer-reviewed.

The files are stored in a persistent OSF project at [https://osf.io/65gre/](https://osf.io/65gre/).

## Installation

From the root directory, install dependencies with node.

    npm install

Then, run the server locally via the `idyll` command, from the root directory.

    idyll

The blog post should open in a window at `localhost:3000`.

## License

This work is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

```
Authors: @dylancashman
OC: @mjskay
AE: @leibatt
R1: @Chenglong-MS
R2: @wowjyu
R3: @MarkoAngelini
R4: @janeadams
AY: @domoritz
```
