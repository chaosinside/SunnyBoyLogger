SELECT date(`datetime`) as `date`, count(`id`) as `records`, SUM(`kw`)/(count(`id`)/24) as `kwh` 
FROM sunnyboy.production group by `date` order by `date` desc;