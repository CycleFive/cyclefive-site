+++
title = "A Rubric for \"Constant X Appears in Nature\" Claims"
description = "Five criteria for separating mechanism from numerology, with the Wilson Ratio Scout search as a worked null."
date = 2026-10-20
[extra]
lead = "Coincidence is cheap and mechanism is not. Five criteria that ask for the mechanism first, a worked null from a 5.5×10¹⁰-combination search, and four calibration cases from phyllotaxis to Eddington."
+++

## The problem: coincidence is cheap, mechanism is not

Any claim of the form "number X appears in nature" has to beat a base rate that is almost never stated. The space of short expressions in a handful of ingredients (small integers, π, e, φ, √2, a few named primes) grows exponentially with expression length, while the set of interesting dimensionless targets (α, mass ratios, Planck ratios, coupling constants) is a few dozen numbers known to between 3 and 12 significant figures. A search over N expressions against a target known to relative precision ε should expect on the order of N·ε accidental matches. That is an order-of-magnitude estimate: it assumes the expression values are spread roughly uniformly in log-space near the target, so the expected count is about 2Nε divided by the log-range the values cover, and real expression families cluster. Even so, a hit at 10⁻⁶ precision from a space of 10⁷ expressions is the expected outcome, not a discovery.

Numerological claims are almost always constructed in the following order: pick the numbers, search for the expressions, find a match (which you always will), then look for or build a story. Now that an expression search, a typeset paper and a DOI cost an afternoon, we think it more productive, rather than argue with each claim as it arrives, to hand claimants the means to *establish their claims*.

The rubric below exists to provide that. It asks for the mechanism first and treats the numerical match as the last and weakest link. Each criterion is stated without reference to what X is: it applies to φ in a seashell, to 137 in Eddington's hands, and to a sporadic arithmetic property such as the Wilson condition p² ∣ (p−1)! + 1, satisfied by only 5, 13 and 563 below 2×10¹³. The criteria are not, however, independent of one another (see below).

The rubric is adapted from the counterexample criteria in Petersen's "Wilson primes in nature" (2026), where it is wrapped around a specific negative hypothesis. The criteria are the reusable part; the hypothesis is a placeholder.

## The rubric

A claim that X plays an essential role in a natural system must satisfy all five. Criteria 1 and 2 are gates: a claim that fails either is not yet a claim about nature. Criteria 3 to 5 then determine how strong it is. A system of tabulated constants counts as observed for criterion 1 when the constants are measurements of a physical process (α, lepton masses); what criterion 1 excludes is a target list or dataset assembled to contain X.

1. **Independent phenomenon.** The system was observed, not built. Supply reproducible measurements, or independent confirmation where repetition is impossible. Anything deliberately constructed to compute, display or encode X is excluded, and so is a dataset assembled after the fact to contain it.
2. **Derived connection.** Show why the dynamics select X, or a condition provably equivalent to X, from first principles of the system. A fitted constant, a relabeled state, or a property shared with every nearby value (generic primality, generic irrationality) does not establish it. This is the criterion numerology never meets.
3. **Fixed interpretation.** State what is measured before the match is sought. Prefer counts and dimensionless ratios. Any unit choice, normalization or labeling must be justified by the physics, not chosen because it produces X.
4. **Independent prediction.** Derive a consequence that was not used to select or fit the mechanism, test it, and report the uncertainty. State the size of the search that produced the claim (number of expressions, targets and tolerances) so the look-elsewhere effect can be estimated.
5. **Specificity.** Say what X contributes that a neighboring value would not. Re-run the argument with substitute values under the same modeling freedom and the same physical constraints; if the substitutes work as well, the mechanism does not use X.

A mechanism need not produce every instance of X. One fully explained instance with a validated prediction outweighs a catalog of unexplained matches.

## What each criterion catches

Each criterion is aimed at one recurring move. A claim that trips a gate is not yet about nature; one that trips none is a candidate for physics.

The criteria overlap. A dataset assembled after the fact (1) and a data subset chosen so the number lands (3) are the same failure seen from two sides, and the substitute-value controls that settle 5 are also the evidence that makes the search-size disclosure in 4 meaningful. The overlap is redundancy, not five independent tests: a claim can fail two criteria for one reason, so count failures as diagnostics, not as votes.

<div class="table-wrap table-wrap--prose">

| Criterion | The move it blocks | Classic instance |
| --- | --- | --- |
| 1. Phenomenon | Finding X in an artifact, a curated list, or a system designed to produce it | Spiral galaxies and φ: the fit is to a logarithmic spiral with a free pitch; φ is chosen by the observer, not the galaxy |
| 2. Derivation | Post hoc story after a numerical hit; invoking generic properties (primality, irrationality) to explain a specific value | Eddington's 136 → 137 for 1/α; the "derivation" was adjusted when the measurement moved |
| 3. Interpretation | Picking units, normalization or a subset of the data so the number lands | Pyramid and φ/π claims: the match depends on which dimensions, which cubit, and which pyramid |
| 4. Prediction | Reporting only the hit; hiding the search size; fitting and testing on the same data | Any expression search over physical constants reported without N and ε |
| 5. Specificity | Never checking whether a neighboring value would serve equally well | "Prime periods avoid predators" without testing that 12 or 14 fail the same model |

</div>

The common thread: every one of these moves adds a degree of freedom after the target is known. The rubric's job is to force those degrees of freedom to be fixed in advance and counted.

## Worked null: the Wilson Ratio Scout search

Petersen's Wilson Ratio Scout (v1.0.0, October 2026) is a useful example because it was run with controls and reported honestly, and because its result shows that a numerical search cannot satisfy the rubric whatever it finds.

**Setup.** Ingredients: the three known Wilson primes 5, 13, 563 and φ (φ is in the basis for every target except φ itself). Expression family, in the wider of its two passes: (m/n)·5ᵃ·13ᵇ·563ᶜ·φᵈ with integer or half-integer exponents from −8 to +8 and a rational prefactor m/n with m, n ≤ 16, which allows 79 prefactors. Targets: φ, α⁻¹, α⁻¹/φ, α⁻¹φ, ℓP/λ̄e and ℓP/a₀, with the measured ones frozen to CODATA 2022. Controls: the same searches re-run with 100 sampled prime replacements for 563 in [282, 1126], keeping 5 and 13 fixed, plus the composite neighbor 564. Reported scale: 54,677,747,904 expression–target combinations, with the caveat that this counts related targets and comparison runs rather than independent hypotheses.

**Result.** The best relative errors were 1.9×10⁻⁷ for α⁻¹ (about 1,200 standard uncertainties off, so not a match), 2.0×10⁻⁶ for ℓP/λ̄e and 1.1×10⁻⁶ for ℓP/a₀. The two Planck ratios, which share constants and are related through α, landed within their standard uncertainties u_t, dominated by the uncertainty in the Planck length. But 75 and 61 of the 100 control triples fit those two targets at least as closely (24 of 100 for α⁻¹). No Wilson-specific relationship was established.

**Scored against the rubric.**

<div class="table-wrap table-wrap--prose">

| Criterion | Status | Why |
| --- | --- | --- |
| 1. Phenomenon | Partial | α⁻¹ and the two Planck ratios are measured constants, which count as observed; φ is a mathematical constant, and α⁻¹/φ and α⁻¹φ carry the same measured information as α⁻¹, so half the target list is the searcher's construction rather than an observation |
| 2. Derivation | Fails | Nothing in the search relates the Wilson condition p² ∣ (p−1)!+1 to any dynamics; only the integer values of p enter, and every hit carries a free prefactor (3/7, 11/16, 11/14), the fitted constant this criterion excludes |
| 3. Interpretation | Partial | Targets are dimensionless, which is right; but the target list and the inclusion of φ were chosen by the searcher |
| 4. Prediction | Fails, but correctly reported | No out-of-sample test exists; N, the search bounds and the u_t comparison were published, though no match tolerance was declared, which is the honest form of failing this criterion |
| 5. Specificity | Fails, by the search's own evidence | Replacement primes for 563, with 5 and 13 held fixed, did at least as well in 23 to 75 of 100 runs depending on the target; the hits are typical of the family, so they carry no information about Wilson primality |

</div>

The verdict is "Fails gate", at criterion 2; as with the calibration cases below, rows 3–5 are diagnostics.

**The lesson.** The null result is not evidence that nature avoids Wilson primes. It is evidence that criterion 2 cannot be reached from the value side: a search over expressions in 5, 13 and 563 tests the digits of those primes, not the property that makes them Wilson primes. Had the search found a 12-digit match, criterion 5 would still have been open and criterion 2 untouched. The only road to a positive claim runs through a mechanism that computes, or is provably equivalent to, the congruence itself, and no amount of ratio-fitting substitutes for that.

## Calibration cases

A rubric that rejects everything is useless. These four claims span the range from established mechanism to pure numerology, and the rubric separates them.

<div class="table-wrap table-wrap--prose">

| Claim | 1 Phenomenon | 2 Derivation | 3 Interpretation | 4 Prediction | 5 Specificity | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| φ in phyllotaxis (golden angle, Fibonacci parastichies) | Pass | Pass | Pass | Pass | Pass | Established |
| 13- and 17-year periodical cicadas | Pass | Partial | Pass | Partial | Partial | Plausible, contested |
| Koide formula for charged-lepton masses | Pass | Fail | (Partial) | (Pass) | (Pass) | Fails gate; unexplained survivor |
| Eddington's 137 for 1/α | Pass | Fail | (Pass) | (Fail) | (Fail) | Fails gate; numerology |

</div>

Parenthesized scores are diagnostic only: a claim that fails a gate gets the verdict "Fails gate", and its 3–5 scores say only what kind of gate-failer it is.

**Phyllotaxis.** Douady and Couder showed, in a ferrofluid experiment and a matching model, that primordia placed at the point of least repulsion from their predecessors converge on the golden angle when growth is slow, along the Fibonacci branch of their bifurcation diagram; other branches give other patterns. Vogel's model had earlier shown that a constant 137.5° divergence reproduces sunflower heads. The mechanism is derived (criterion 2), and it predicts the parastichy pairs and their transitions (4). Specificity (5) comes from the continued fraction \[1; 1, 1, ...\]: φ and the noble numbers equivalent to it are the worst-approximable irrationals, which is what keeps successive primordia from lining up. The Lucas pattern, also observed, sits on a separate branch near 99.5°, not near 137.5°. Criterion 3 is a Pass with a caveat: counting parastichies on real plants involves observer judgment, and published counts include non-Fibonacci cases. This is what a full pass looks like.

**Cicadas.** The phenomenon is real and the unit (years) is fixed. The derivation, avoiding resonance with shorter predator or competitor cycles and limiting brood hybridization, selects prime periods (a prime has no shorter divisor for a predator cycle to lock onto), but nothing beyond primality singles out 13 or 17, and predator-prey models produce prime cycles only in some parameter ranges. Out-of-sample prediction is hard; the claim stays open.

**Koide.** The relation (mₑ + mμ + mτ) / (√mₑ + √mμ + √mτ)² = 2/3 has no accepted derivation, so it fails the gate at criterion 2. Its 3–5 scores are still informative. On 4: Koide's 1982 relation gives m_τ = 1776.97 MeV from mₑ and mμ, when the measured value was 1784.2 ± 3.2 MeV, as Koide recounts in his 2018 retrospective; the 1992 measurements moved to 1776.9 MeV, and the current PDG value, 1776.93 ± 0.09 MeV, agrees within its 5×10⁻⁵ relative uncertainty. On 5: the value 2/3 is specific, since the ratio is bounded between 1/3 and 1 and other simple fractions (1/2, 3/4) are excluded by the data at many standard deviations. Foot pointed out in 1994 that the relation holds for the physical (pole) masses, not the running masses at a common scale, which is a criterion-3 flag. The rubric's verdict, fails the gate but not numerology, matches the field's.

**Eddington.** A derivation that produced 136 in January 1929 against a measured 137.1, was revised to 137 in a November 1929 note, and has no successor is the template for failing criteria 2 and 4 together.

## Using the rubric

**Scoring.** Mark each criterion Pass, Partial or Fail. A Fail on 1 or 2 gives the verdict "Fails gate": the claim is not yet about nature, and 3–5 may be scored only as diagnostics. A Partial on a gate lets the claim through but caps its strength at Partial. Among gate failures, diagnostics that pass 4 and 5 mark an unexplained survivor worth a search for mechanism; diagnostics that fail them mark numerology. With both gates passed, the claim's strength is the weakest of 3, 4 and 5. Report the scores, not a composite; a single number hides which degree of freedom is doing the work.

**Search disclosure.** Any claim that originated in a numerical search must state the number of expressions N, the number of targets, and the relative tolerance ε at which a match was declared. The quantity N·ε is a rough count of expected accidental hits; a match is interesting only when N·ε is well below 1. The Wilson Ratio Scout did not declare a tolerance; it ranked by |log(x/t)| and compared against u_t. Against Planck-ratio targets with relative uncertainty of order 10⁻⁵, a near-miss at 10⁻⁶ is expected from a search this size, even after discounting its 5.5×10¹⁰ count for correlated targets and comparison runs, and the controls confirm it: for both Planck ratios, most replacement triples did as well.

**For a claimant,** the order of work is the reverse of the search: mechanism, then measurement mapping, then prediction, then the match. A claim written in that order will usually survive its own criterion-5 check or collapse before publication.

**For a reviewer,** the checklist:

- [ ] Was the system observed before X was sought in it?
- [ ] Is there a derivation from the system's dynamics to X, or an equivalent condition, with no free constants tuned to X?
- [ ] Were units, normalization and data subset fixed before the match?
- [ ] Is there a prediction not used in the fit, with stated uncertainty and search size?
- [ ] Do substitute values fail under the same modeling freedom?

**Scope.** The rubric says nothing about whether X is interesting mathematically. Wilson primes, Wieferich primes and the Koide ratio are all legitimate objects of study whether or not any physical process uses them. The rubric only answers one question: has the claim that nature uses X been made in a form that could be wrong?

## References

- Petersen, C. G. (2026). Wilson primes in nature, v1.0.0. [whispr.dev](https://whispr.dev/writing/petersens-hypothesis/) · [Zenodo doi:10.5281/zenodo.23489260](https://doi.org/10.5281/zenodo.23489260) · [repository](https://github.com/whisprer/petersens-hypothesis/)
- [OEIS A007540](https://oeis.org/A007540), Wilson primes
- Costa, E., Gerbicz, R. and Harvey, D. (2014). A search for Wilson primes. Math. Comp. 83, 3071. [arXiv:1209.3436](https://arxiv.org/abs/1209.3436)
- [NIST CODATA 2022](https://physics.nist.gov/cuu/pdf/all.pdf) recommended values
- Vogel, H. (1979). A better way to construct the sunflower head. Math. Biosci. 44, 179–189. [doi:10.1016/0025-5564(79)90080-4](https://doi.org/10.1016/0025-5564(79)90080-4)
- Douady, S. and Couder, Y. (1992). Phyllotaxis as a physical self-organized growth process. Phys. Rev. Lett. 68, 2098. [doi:10.1103/PhysRevLett.68.2098](https://doi.org/10.1103/PhysRevLett.68.2098)
- Koide, Y. (1982). Fermion-boson two-body model of quarks and leptons and Cabibbo mixing. Lett. Nuovo Cimento 34, 201. [doi:10.1007/BF02817096](https://doi.org/10.1007/BF02817096)
- Foot, R. (1994). A note on Koide's lepton mass relation. [arXiv:hep-ph/9402242](https://arxiv.org/abs/hep-ph/9402242)
- Koide, Y. (2018). What physics does the charged lepton mass relation tell us? [arXiv:1809.00425](https://arxiv.org/abs/1809.00425)
- Particle Data Group (2024). τ mass, Review of Particle Physics. [pdg.lbl.gov](https://pdg.lbl.gov/2024/listings/rpp2024-list-tau.pdf)
- Koide, Y. (1983). A fermion-boson composite model of quarks and leptons. Phys. Lett. B 120, 161.
- Campos, P. R. A., de Oliveira, V. M., Giro, R. and Galvão, D. S. (2004). Emergence of prime numbers as the result of evolutionary strategy. Phys. Rev. Lett. 93, 098107. [doi:10.1103/PhysRevLett.93.098107](https://doi.org/10.1103/PhysRevLett.93.098107)
- Eddington, A. S. (1929). The charge of an electron. Proc. R. Soc. A 122, 358. [doi:10.1098/rspa.1929.0025](https://doi.org/10.1098/rspa.1929.0025)
- Eddington, A. S. (1929). The charge of an electron. Nature 124, 840. [doi:10.1038/124840b0](https://doi.org/10.1038/124840b0)
- Eddington, A. S. (1946). Fundamental Theory. Cambridge University Press.
