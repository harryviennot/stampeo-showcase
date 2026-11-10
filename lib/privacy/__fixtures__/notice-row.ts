import { rowFor } from "../policy";
import type { PolicyRow } from "../policy-matrix";

/**
 * The US row as it would be if the matrix declared a notice: an opt-out row
 * whose surface is `notice`. The shipped US row shows nothing, so this is how
 * the notice path is exercised.
 */
export const US_NOTICE: PolicyRow = { ...rowFor("US"), surface: "notice" };
