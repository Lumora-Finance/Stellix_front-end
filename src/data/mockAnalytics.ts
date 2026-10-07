import type { Analytics } from "@/types";
export const mockAnalytics: Analytics = {
 points:[
  {date:"Apr",balance:7200,income:3100,expenses:1900,volume:5000},{date:"May",balance:8050,income:3800,expenses:2400,volume:6200},{date:"Jun",balance:7600,income:2950,expenses:2800,volume:5750},{date:"Jul",balance:9400,income:4600,expenses:2100,volume:6700},{date:"Aug",balance:10680,income:5100,expenses:2620,volume:7720},{date:"Sep",balance:12480,income:6350,expenses:2910,volume:9260}],
 totalVolume:41340,income:6350,expenses:2910,netFlow:3440,averageTransaction:984.76,
 invoicePerformance:[{name:"Paid",value:68},{name:"Pending",value:20},{name:"Overdue",value:8},{name:"Draft",value:4}],
 assetDistribution:[{name:"USDC",value:70.05},{name:"XLM",value:24.88},{name:"EURC",value:5.07}],
};
