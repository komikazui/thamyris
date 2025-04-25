import React from "react";

import Header from "@/components/common/header";
import NewsCard from "@/components/common/newscard";

const newsBulletin = [
	{
		id: 1,
		title: "Latest Server Update",
		date: `${env.BUILD_DATE_YEAR_MONTH_DAY}`,
		time: `${env.BUILD_TIME_12_HOUR} UTC`,
	},
];

const ServerNews = () => {
	return (
		<div className="relative z-10 flex-1 overflow-auto">
			<Header title={"Server Updates"} />

			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="space-y-6">
					{newsBulletin.map((item) => (
						<NewsCard key={item.id} title={item.title} date={item.date} time={item.time} />
					))}
				</div>
			</div>
		</div>
	);
};

export default ServerNews;
