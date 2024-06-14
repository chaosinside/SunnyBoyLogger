select year(`datetime`), month(`datetime`), day(last_day(`datetime`)) as `day_count`, count(`id`) as `count`, sum(`kw`)/(count(`id`)/(24*day(last_day(`datetime`)))) as `kWh`
from `sunnyboy`.`production`
group by year(`datetime`), month(`datetime`)
order by year(`datetime`) desc, month(`datetime`);