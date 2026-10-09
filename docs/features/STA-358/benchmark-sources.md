# Benchmark sources

Where the figures in `lib/plans/benchmark.ts` come from: the cohort rules and the read-only SQL that produced them on the production database, all markets combined, pulled 2026-10-09. The history is short (first scan 2026-02-10, 99.9% of qualifying scans in the last six months), so "all-time" and "last six months" are the same thing. The values in the code are these results rounded down.

The founders' own e-mail addresses in the exclusion list are replaced by placeholders below; the exclusion itself is described in the cohort rules.

## Figure to query

| `BENCHMARK` key | Query | Column, row `ALL` |
|---|---|---|
| `walletAddRate` | Q3 | `pct_with_install_event` (members enrolled since 2026-07-01, the cohort for which Google Wallet callbacks worked) |
| `appleShare` | Q3 | `pct_apple` (share of detected adds) |
| `installedDay30`, `installedDay90` | Q8 | `pct_installed_d30`, `pct_installed_d90` (installs from 2026-06-01) |
| `return30` | Q4 | `pct_ret_30d` (members whose first visit was 30+ days ago) |
| `medianDaysToSecondVisit` | Q4 | `med_gap_days_all` over `n_returners` |
| `redeemedShare` | Q6 | `pct_redeemed` over `genuine_completions_30dold` (a genuine completion fills the card on a later local day than the first visit) |
| `medianStampsPerCard` | Q7 | `q_med_T` (stamp programs of qualifying businesses; 10 is the product default) |

## Cohort rules

| Rule | Definition | Effect |
|---|---|---|
| Internal / test exclusion | Owner email is one of the founders' own addresses, any `@stampeo.app`, `testsample%`, OR business name matches the whole word `test`/`demo` | 16 of 800 businesses excluded (the founders' own businesses and test accounts). No `is_test` flag exists in the schema. No `is_test` flag exists in the schema. |
| Staff / owner self-cards | A customer whose email, phone digits or name equals a member (owner/admin/scanner) of the same business | 477 customers excluded. Owner test cards with a fake name are NOT caught (see caveats). |
| Visit / scan | `transactions.type in ('stamp_added','points_earned')`, `source='scanner'`, not voided (no `voided_transaction_id` pointing to it). A **visit** = a distinct (customer, local date). | Dashboard manual adds (≈2,400 rows: "Forgot to scan", "Transfer", bonuses) are excluded from visit metrics because their timestamp is not the visit time. |
| **Qualifying business** | Non-internal, at least 10 non-staff customers, AND at least 10 scanner scans of non-staff customers | **86 businesses**. All benchmark metrics use this set unless stated otherwise. |
| Active (30d) | At least 1 qualifying scan in the last 30 days | |
| Country | `businesses.country`; when NULL (212 businesses created before the field shipped, never backfilled in prod), the owner's phone country code, else the dominant customer phone country code (at least 5 phones and 60% share). +1 numbers are split into US, CA and Caribbean by area code. | 26 of 86 qualifying businesses have an **inferred** country; 6 remain unknown (`??`). |
| Category | `settings.business_type`, falling back to legacy `settings.category` (`salon` mapped to `beauty`); `other` re-labelled by keywords in `business_type_other` (e.g. nails/lash/brow/esthetic/clinic -> beauty; matcha/coffee/acai -> cafe) | Category exists for 774 of 800 businesses. It is NOT dropped (memory note outdated): it lives in `businesses.settings`. |
| Local time | `businesses.timezone` is **'UTC' for all 800 rows** (useless). Local time = country time zone; US/CA = mapped from the dominant customer area code (or owner area code). | 1 US qualifying business defaulted to Central time. Per-business errors of 1 to 3 hours are possible in the US. |
| Region | US, FR, Rest (everything else, incl. unknown) | |

Not publishable from this data: broadcast uplift, France-only or US-only figures (France has 5 qualifying businesses), and stamps-vs-points comparisons. Four businesses hold about 30% of members and three hold 43% of completed cards, so quote the pooled rates with their `n`.

## SQL

Every query is `BASE` followed by the tail shown; each tail starts with `,` and continues the `WITH`.

### BASE

```sql
with
founder(email) as (values ('<founder address 1>'),('<founder address 2>'),('<founder address 3>')),
cc(code, iso) as (values ('1','NANP'),('33','FR'),('44','GB'),('32','BE'),('41','CH'),('971','AE'),('966','SA'),('965','KW'),('974','QA'),('973','BH'),('968','OM'),('962','JO'),('52','MX'),('63','PH'),('34','ES'),('49','DE'),('212','MA'),('216','TN'),('961','LB'),('60','MY'),('91','IN'),('62','ID'),('61','AU'),('57','CO'),('31','NL'),('48','PL'),('39','IT'),('351','PT'),('30','GR'),('90','TR'),('20','EG'),('27','ZA'),('353','IE'),('359','BG'),('507','PA'),('65','SG'),('852','HK'),('64','NZ'),('55','BR'),('54','AR'),('56','CL'),('51','PE'),('506','CR'),('502','GT'),('596','MQ'),('594','GF'),('590','GP'),('262','RE'),('47','NO'),('46','SE'),('45','DK'),('43','AT'),('40','RO'),('380','UA'),('377','MC'),('352','LU'),('503','SV'),('593','EC'),('372','EE')),
ca_ac(ac) as (select unnest(string_to_array('204,226,236,249,250,257,263,289,306,343,354,365,367,368,382,387,403,416,418,428,431,437,438,450,460,468,474,506,514,519,548,579,581,584,587,604,613,639,647,672,683,705,709,742,753,778,780,782,807,819,825,867,873,879,902,905,942',','))),
carib_ac(ac) as (select unnest(string_to_array('242,246,264,268,284,340,345,441,473,649,658,664,670,671,684,721,758,767,784,787,809,829,849,868,869,876,939',','))),
tz_ac(ac,tz) as (select split_part(x,':',1), split_part(x,':',2) from unnest(string_to_array(
'209:America/Los_Angeles,213:America/Los_Angeles,310:America/Los_Angeles,323:America/Los_Angeles,424:America/Los_Angeles,442:America/Los_Angeles,503:America/Los_Angeles,530:America/Los_Angeles,559:America/Los_Angeles,562:America/Los_Angeles,626:America/Los_Angeles,661:America/Los_Angeles,707:America/Los_Angeles,714:America/Los_Angeles,760:America/Los_Angeles,909:America/Los_Angeles,916:America/Los_Angeles,951:America/Los_Angeles,702:America/Los_Angeles,725:America/Los_Angeles,206:America/Los_Angeles,415:America/Los_Angeles,510:America/Los_Angeles,408:America/Los_Angeles,818:America/Los_Angeles,858:America/Los_Angeles,619:America/Los_Angeles,949:America/Los_Angeles,805:America/Los_Angeles,'
||'720:America/Denver,303:America/Denver,406:America/Denver,208:America/Denver,385:America/Denver,801:America/Denver,915:America/Denver,505:America/Denver,719:America/Denver,970:America/Denver,'
||'520:America/Phoenix,602:America/Phoenix,480:America/Phoenix,623:America/Phoenix,928:America/Phoenix,'
||'469:America/Chicago,214:America/Chicago,972:America/Chicago,210:America/Chicago,945:America/Chicago,832:America/Chicago,281:America/Chicago,346:America/Chicago,713:America/Chicago,409:America/Chicago,405:America/Chicago,504:America/Chicago,225:America/Chicago,318:America/Chicago,708:America/Chicago,815:America/Chicago,312:America/Chicago,773:America/Chicago,615:America/Chicago,251:America/Chicago,334:America/Chicago,205:America/Chicago,219:America/Chicago,512:America/Chicago,817:America/Chicago,'
||'336:America/New_York,978:America/New_York,781:America/New_York,617:America/New_York,443:America/New_York,410:America/New_York,301:America/New_York,240:America/New_York,475:America/New_York,203:America/New_York,347:America/New_York,718:America/New_York,212:America/New_York,917:America/New_York,302:America/New_York,860:America/New_York,404:America/New_York,678:America/New_York,770:America/New_York,813:America/New_York,407:America/New_York,954:America/New_York,305:America/New_York,786:America/New_York,765:America/New_York,229:America/New_York,'
||'808:Pacific/Honolulu,438:America/Toronto,514:America/Toronto,416:America/Toronto,647:America/Toronto,604:America/Vancouver,778:America/Vancouver', ',')) x),
tz_cty(country,tz) as (select split_part(x,':',1), split_part(x,':',2) from unnest(string_to_array(
'FR:Europe/Paris,GB:Europe/London,BE:Europe/Brussels,CH:Europe/Zurich,AE:Asia/Dubai,SA:Asia/Riyadh,KW:Asia/Kuwait,QA:Asia/Qatar,BH:Asia/Bahrain,OM:Asia/Muscat,JO:Asia/Amman,MX:America/Mexico_City,PH:Asia/Manila,ES:Europe/Madrid,DE:Europe/Berlin,MA:Africa/Casablanca,TN:Africa/Tunis,LB:Asia/Beirut,MY:Asia/Kuala_Lumpur,IN:Asia/Kolkata,ID:Asia/Jakarta,AU:Australia/Sydney,CO:America/Bogota,NL:Europe/Amsterdam,PL:Europe/Warsaw,IT:Europe/Rome,PT:Europe/Lisbon,GR:Europe/Athens,TR:Europe/Istanbul,EG:Africa/Cairo,ZA:Africa/Johannesburg,IE:Europe/Dublin,BG:Europe/Sofia,PA:America/Panama,SG:Asia/Singapore,HK:Asia/Hong_Kong,NZ:Pacific/Auckland,BR:America/Sao_Paulo,AR:America/Argentina/Buenos_Aires,CL:America/Santiago,PE:America/Lima,CR:America/Costa_Rica,GT:America/Guatemala,MQ:America/Martinique,GF:America/Cayenne,NO:Europe/Oslo,SE:Europe/Stockholm,DK:Europe/Copenhagen,AT:Europe/Vienna,RO:Europe/Bucharest,UA:Europe/Kiev,EE:Europe/Tallinn,LU:Europe/Luxembourg,MC:Europe/Monaco,SV:America/El_Salvador,EC:America/Guayaquil', ',')) x),
owner as (select distinct on (m.business_id) m.business_id, lower(u.email) email, regexp_replace(coalesce(u.phone,''),'[^0-9+]','','g') ph
          from memberships m join users u on u.id=m.user_id where m.role='owner' order by m.business_id, m.created_at),
own_cc as (select o.business_id, (select cc.iso from cc where o.ph like '+'||cc.code||'%' order by length(cc.code) desc limit 1) iso, substr(o.ph,3,3) ac from owner o where o.ph like '+%'),
cust_iso as (select c.business_id, (select cc.iso from cc where p like '+'||cc.code||'%' order by length(cc.code) desc limit 1) iso, substr(p,3,3) ac
             from (select business_id, regexp_replace(phone,'[^0-9+]','','g') p from customers where phone like '+%') c),
cust_cc as (select business_id, mode() within group (order by iso) iso, count(*) n,
                   mode() within group (order by ac) filter (where iso='NANP') ac, count(*) filter (where iso='NANP') n_nanp from cust_iso where iso is not null group by business_id),
cust_cc2 as (select cc2.*, (select count(*) from cust_iso ci where ci.business_id=cc2.business_id and ci.iso=cc2.iso)::numeric/cc2.n share from cust_cc cc2),
biz0 as (
  select b.id, b.name, b.created_at, b.primary_locale, o.email owner_email,
    coalesce(b.country, oc.iso, case when cc2.n>=5 and cc2.share>=0.6 then cc2.iso end) country_raw,
    coalesce(case when cc2.n_nanp>=5 then cc2.ac end, case when oc.iso='NANP' then oc.ac end, cc2.ac) nanp_ac,
    lower(coalesce(nullif(b.settings->>'business_type',''), case b.settings->>'category' when 'salon' then 'beauty' else b.settings->>'category' end, 'unknown')) cat_raw,
    lower(coalesce(b.settings->>'business_type_other','')) cat_other,
    (coalesce(o.email,'') in (select email from founder) or coalesce(o.email,'') like '%@stampeo.app' or coalesce(o.email,'') like 'testsample%' or b.name ~* '\m(test|demo)\M') is_internal
  from businesses b left join owner o on o.business_id=b.id left join own_cc oc on oc.business_id=b.id left join cust_cc2 cc2 on cc2.business_id=b.id),
bizc as (
  select id, name, created_at, is_internal,
    case when country_raw='NANP' then case when nanp_ac in (select ac from ca_ac) then 'CA' when nanp_ac in (select ac from carib_ac) then 'NANP-other' else 'US' end
         else coalesce(country_raw,'??') end country,
    case when cat_raw='other' and cat_other ~ '(nail|lash|brow|beaut|esth|aesthetic|spa|hair|barber|salon|skin|makeup|wax|clinic|laser|inject|tattoo)' then 'beauty'
         when cat_raw='other' and cat_other ~ '(coffee|caf|matcha|tea|acai|açaí|smoothie|juice|boba)' then 'cafe'
         when cat_raw='other' and cat_other ~ '(bak|pastr|cake|donut|dessert)' then 'bakery'
         when cat_raw='other' and cat_other ~ '(restau|food|pizza|burger|grill|kitchen)' then 'restaurant'
         when cat_raw='other' and cat_other ~ '(shop|store|boutique|cloth|retail|vape|flower)' then 'retail'
         else cat_raw end category,
    nanp_ac
  from biz0),
biz as (select bz.*, case when bz.country in ('US','CA') then coalesce((select tz from tz_ac where ac=bz.nanp_ac), case bz.country when 'US' then 'America/Chicago' else 'America/Toronto' end)
                      else (select tz from tz_cty where country=bz.country) end tz,
               (bz.country in ('US','CA') and (select tz from tz_ac where ac=bz.nanp_ac) is null) tz_defaulted
        from bizc bz),
staff_cust as (select distinct c.id from customers c join memberships m on m.business_id=c.business_id join users u on u.id=m.user_id
   where lower(u.email)=lower(c.email) or (coalesce(u.phone,'')<>'' and regexp_replace(u.phone,'[^0-9]','','g')=regexp_replace(coalesce(c.phone,''),'[^0-9]','','g')) or lower(u.name)=lower(c.name)),
cust as (select c.id, c.business_id, c.created_at from customers c join biz on biz.id=c.business_id and not biz.is_internal where c.id not in (select id from staff_cust)),
voided as (select voided_transaction_id id from transactions where voided_transaction_id is not null),
scan as (select t.id, t.business_id, t.customer_id, t.created_at, t.type, (t.created_at at time zone coalesce(biz.tz,'UTC')) lts
         from transactions t join cust on cust.id=t.customer_id join biz on biz.id=t.business_id
         where t.type in ('stamp_added','points_earned') and t.source='scanner' and t.id not in (select id from voided)),
bstats as (select biz.id, coalesce(c.n,0) n_cust, coalesce(s.n,0) n_scan, s.last_scan from biz
           left join (select business_id, count(*) n from cust group by 1) c on c.business_id=biz.id
           left join (select business_id, count(*) n, max(created_at) last_scan from scan group by 1) s on s.business_id=biz.id where not biz.is_internal),
qbiz as (select biz.*, bs.n_cust, bs.n_scan, bs.last_scan, case when biz.country in ('US','FR') then biz.country else 'Rest' end region
         from biz join bstats bs on bs.id=biz.id where bs.n_cust>=10 and bs.n_scan>=10)
```

### Q3 Wallet adoption and Apple/Google split

```sql
-- BASE ...
,
inst as (select distinct on (t.customer_id) t.customer_id, t.metadata->>'wallet_type' wt from transactions t join cust c on c.id=t.customer_id
         where t.type in ('card_added','card_re_added') order by t.customer_id, t.created_at),
y as (select c.id, c.business_id, i.wt, case when b.country in ('US','FR') then b.country else 'Rest' end region, b.country
      from cust c join qbiz b on b.id=c.business_id left join inst i on i.customer_id=c.id where c.created_at >= '2026-07-01')
select coalesce(region,'ALL') region, count(distinct business_id) q_biz,
  count(*) customers_since_jul1, count(wt) installed, round(100.0*count(wt)/count(*),1) pct_with_install_event,
  round(100.0*count(*) filter (where wt='apple')/nullif(count(wt),0),1) pct_apple, round(100.0*count(*) filter (where wt='google')/nullif(count(wt),0),1) pct_google,
  (select percentile_cont(0.5) within group (order by s) from (select y2.business_id, 100.0*count(*) filter (where wt='apple')/nullif(count(wt),0) s from y y2 where (y.region is null or y2.region=y.region) group by 1 having count(wt)>=10) z) med_biz_pct_apple,
  (select count(*) from (select y2.business_id from y y2 where (y.region is null or y2.region=y.region) group by 1 having count(wt)>=10) z) n_biz_10plus_installs
from y group by rollup(region) order by 1;
```

### Q4 Customer-pooled retention and the gap between visits

```sql
-- BASE ...
,
vd as (select s.customer_id, (s.lts)::date d from scan s join qbiz q on q.id=s.business_id group by 1,2),
pc as (select customer_id, min(d) d1, count(*) ndays, (array_agg(d order by d))[2] d2 from vd group by 1),
z as (select c.id, q.id bid, q.region, q.category, pc.d1, pc.d2, pc.ndays from cust c join qbiz q on q.id=c.business_id left join pc on pc.customer_id=c.id)
select coalesce(region,'ALL') region, count(distinct bid) nbiz,
 count(*) enrolled, count(d1) scanned, round(100.0*count(d1)/count(*),1) pct_scanned,
 count(*) filter (where d1 <= current_date-30) elig30, round(100.0*count(*) filter (where d1 <= current_date-30 and d2 <= d1+30)/nullif(count(*) filter (where d1 <= current_date-30),0),1) pct_ret_30d,
 count(*) filter (where d1 <= current_date-60) elig60, round(100.0*count(*) filter (where d1 <= current_date-60 and d2 <= d1+60)/nullif(count(*) filter (where d1 <= current_date-60),0),1) pct_ret_60d,
 round(100.0*count(*) filter (where d1 <= current_date-60 and ndays>=2)/nullif(count(*) filter (where d1 <= current_date-60),0),1) pct_ret_ever_elig60,
 round(100.0*count(*) filter (where ndays>=2)/nullif(count(d1),0),1) pct_ret_ever_all,
 percentile_cont(0.5) within group (order by d2-d1) filter (where d2 is not null) med_gap_days_all,
 percentile_cont(0.25) within group (order by d2-d1) filter (where d2 is not null) p25_gap,
 percentile_cont(0.75) within group (order by d2-d1) filter (where d2 is not null) p75_gap,
 count(d2) n_returners,
 round(100.0*count(*) filter (where d1 <= current_date-60 and ndays=1)/nullif(count(*) filter (where d1 <= current_date-60),0),1) e60_1v,
 round(100.0*count(*) filter (where d1 <= current_date-60 and ndays=2)/nullif(count(*) filter (where d1 <= current_date-60),0),1) e60_2v,
 round(100.0*count(*) filter (where d1 <= current_date-60 and ndays=3)/nullif(count(*) filter (where d1 <= current_date-60),0),1) e60_3v,
 round(100.0*count(*) filter (where d1 <= current_date-60 and ndays between 4 and 5)/nullif(count(*) filter (where d1 <= current_date-60),0),1) e60_4_5v,
 round(100.0*count(*) filter (where d1 <= current_date-60 and ndays between 6 and 10)/nullif(count(*) filter (where d1 <= current_date-60),0),1) e60_6_10v,
 round(100.0*count(*) filter (where d1 <= current_date-60 and ndays>10)/nullif(count(*) filter (where d1 <= current_date-60),0),1) e60_11plus,
 round(avg(ndays) filter (where d1 <= current_date-60),2) e60_mean_visits
from z group by rollup(region) order by 1;
```

### Q6 Card completion and redemption

```sql
-- BASE ...
,
prog as (select lp.business_id, lp.type, (lp.config->>'total_stamps')::int T from loyalty_programs lp where lp.is_active),
sq as (select q.*, p.T from qbiz q join prog p on p.business_id=q.id and p.type='stamp'),
vd as (select s.customer_id, min((s.lts)::date) d1, count(distinct (s.lts)::date) ndays from scan s join sq on sq.id=s.business_id group by 1),
comp as (select t.customer_id, t.business_id, t.created_at, (t.created_at at time zone coalesce(sq.tz,'UTC'))::date ld,
                row_number() over (partition by t.customer_id order by t.created_at) k
         from transactions t join cust c on c.id=t.customer_id join sq on sq.id=t.business_id
         where t.type='stamp_added' and t.id not in (select id from voided)
           and ((t.stamps_before < sq.T and t.stamps_before + t.stamp_delta >= sq.T) or t.stamps_after < t.stamps_before)),
redm as (select t.customer_id, t.created_at, row_number() over (partition by t.customer_id order by t.created_at) k
         from transactions t join cust c on c.id=t.customer_id join sq on sq.id=t.business_id where t.type='reward_redeemed'),
cm as (select comp.*, vd.d1, comp.ld > vd.d1 genuine, r.created_at red_at from comp join vd using (customer_id) left join redm r on r.customer_id=comp.customer_id and r.k=comp.k),
firstc as (select customer_id, min(ld) filter (where genuine) fc from cm group by 1),
cz as (select c.id, sq.id bid, sq.region, sq.category, sq.T, vd.d1, vd.ndays, fc.fc from cust c join sq on sq.id=c.business_id join vd on vd.customer_id=c.id left join firstc fc on fc.customer_id=c.id)
select coalesce(region,'ALL') region, count(distinct bid) nbiz,
  count(*) filter (where d1 <= current_date-60) scanned_e60,
  round(100.0*count(*) filter (where d1 <= current_date-60 and fc <= d1+60)/nullif(count(*) filter (where d1 <= current_date-60),0),1) pct_complete_60d,
  round(100.0*count(*) filter (where d1 <= current_date-60 and fc is not null)/nullif(count(*) filter (where d1 <= current_date-60),0),1) pct_complete_ever_e60,
  count(fc) n_completers, percentile_cont(0.5) within group (order by fc-d1) filter (where fc is not null) med_days_to_first_card,
  percentile_cont(0.25) within group (order by fc-d1) filter (where fc is not null) p25_days, percentile_cont(0.75) within group (order by fc-d1) filter (where fc is not null) p75_days,
  (select count(*) from cm where genuine and created_at < now()-interval '30 days' and (cz.region is null or cm.business_id in (select id from sq where sq.region=cz.region))) genuine_completions_30dold,
  (select round(100.0*count(red_at)/nullif(count(*),0),1) from cm where genuine and created_at < now()-interval '30 days' and (cz.region is null or cm.business_id in (select id from sq where sq.region=cz.region))) pct_redeemed,
  (select round(100.0*count(*) filter (where red_at is not null)/nullif(count(*),0),1) from cm where not genuine and (cz.region is null or cm.business_id in (select id from sq where sq.region=cz.region))) pct_redeemed_sameday_completions,
  (select count(*) from cm where not genuine and (cz.region is null or cm.business_id in (select id from sq where sq.region=cz.region))) n_sameday_completions
from cz group by rollup(region) order by 1;
```

### Q7 Program design: card size

```sql
-- BASE ...
,
prog as (select lp.business_id, lp.type, (lp.config->>'total_stamps')::int T, coalesce((lp.config->>'user_configured')::boolean,false) uc from loyalty_programs lp where lp.is_active),
pz as (select b.id, case when b.country in ('US','FR') then b.country else 'Rest' end region, b.category, p.type, p.T, p.uc, (q.id is not null) is_q, bs.n_cust
       from biz b join bstats bs on bs.id=b.id join prog p on p.business_id=b.id left join qbiz q on q.id=b.id where bs.n_cust>=1)
select 'region' dim, coalesce(region,'ALL') grp,
  count(*) filter (where is_q) q_biz, count(*) filter (where is_q and type='points') q_points, round(100.0*count(*) filter (where is_q and type='points')/nullif(count(*) filter (where is_q),0),1) q_pct_points,
  percentile_cont(0.5) within group (order by T) filter (where is_q and type='stamp') q_med_T, mode() within group (order by T) filter (where is_q and type='stamp') q_mode_T,
  min(T) filter (where is_q and type='stamp') q_min_T, max(T) filter (where is_q and type='stamp') q_max_T,
  count(*) filter (where type='stamp') all_stamp_biz_with_cust, percentile_cont(0.5) within group (order by T) filter (where type='stamp') all_med_T, mode() within group (order by T) filter (where type='stamp') all_mode_T,
  round(100.0*count(*) filter (where type='points')/count(*),1) all_pct_points, count(*) all_biz_with_cust
from pz group by rollup(region)
union all
select 'category', category, count(*) filter (where is_q), count(*) filter (where is_q and type='points'), round(100.0*count(*) filter (where is_q and type='points')/nullif(count(*) filter (where is_q),0),1),
  percentile_cont(0.5) within group (order by T) filter (where is_q and type='stamp'), mode() within group (order by T) filter (where is_q and type='stamp'),
  min(T) filter (where is_q and type='stamp'), max(T) filter (where is_q and type='stamp'),
  count(*) filter (where type='stamp'), percentile_cont(0.5) within group (order by T) filter (where type='stamp'), mode() within group (order by T) filter (where type='stamp'),
  round(100.0*count(*) filter (where type='points')/count(*),1), count(*)
from pz group by category order by 1 desc, 3 desc;
```

### Q8 Wallet retention at day 30 and 90

```sql
-- BASE ...
,
lc as (select t.customer_id, t.type, t.created_at, t.metadata->>'wallet_type' wt from transactions t join cust c on c.id=t.customer_id join qbiz q on q.id=t.business_id
       where t.type in ('card_added','card_re_added','card_deleted')),
fi as (select distinct on (customer_id) customer_id, created_at fi_at, wt from lc where type in ('card_added','card_re_added') order by customer_id, created_at),
st as (select fi.customer_id, fi.wt, fi.fi_at,
         (select l.type from lc l where l.customer_id=fi.customer_id and l.created_at <= fi.fi_at + interval '30 days' order by l.created_at desc limit 1) s30,
         (select l.type from lc l where l.customer_id=fi.customer_id and l.created_at <= fi.fi_at + interval '90 days' order by l.created_at desc limit 1) s90,
         exists (select 1 from lc l where l.customer_id=fi.customer_id and l.type='card_deleted' and l.created_at <= fi.fi_at + interval '30 days') del30_any
       from fi),
w as (select st.*, case when b.country in ('US','FR') then b.country else 'Rest' end region from st join cust c on c.id=st.customer_id join biz b on b.id=c.business_id)
select coalesce(region,'ALL') region, coalesce(wt,'all') wallet,
  count(*) filter (where fi_at <= now()-interval '30 days') n30, round(100.0*count(*) filter (where fi_at <= now()-interval '30 days' and s30<>'card_deleted')/nullif(count(*) filter (where fi_at <= now()-interval '30 days'),0),1) pct_installed_d30,
  round(100.0*count(*) filter (where fi_at <= now()-interval '30 days' and del30_any)/nullif(count(*) filter (where fi_at <= now()-interval '30 days'),0),1) pct_any_delete_by_d30,
  count(*) filter (where fi_at <= now()-interval '90 days') n90, round(100.0*count(*) filter (where fi_at <= now()-interval '90 days' and s90<>'card_deleted')/nullif(count(*) filter (where fi_at <= now()-interval '90 days'),0),1) pct_installed_d90
from w where fi_at >= '2026-06-01' group by rollup(region, wt) order by 1,2;
```
