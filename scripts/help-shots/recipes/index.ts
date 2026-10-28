import type { Recipe } from "../lib/types";
import { recipe as changeBusinessProfile } from "./change-your-business-name-logo-and-color";
import { recipe as createAccount } from "./create-your-account";
import { recipe as exportCustomerList } from "./export-your-customer-list";
import { recipe as manageTeamMember } from "./manage-a-team-member";
import { recipe as removeTeamMember } from "./remove-a-team-member";
import { recipe as openingHours } from "./update-your-opening-hours-and-contact-details";
import { recipe as setTimeZone } from "./set-your-time-zone";

/** Every recipe, in the order `--all` runs them. */
export const RECIPES: Recipe[] = [createAccount, exportCustomerList, changeBusinessProfile, openingHours, setTimeZone, manageTeamMember, removeTeamMember];
