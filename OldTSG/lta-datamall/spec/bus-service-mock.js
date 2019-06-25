module.exports = (page, callback) => {
	if (page === 0)
		callback({
			'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#BusServices',
			value: [{
				ServiceNo: '118',
				Operator: 'GAS',
				Direction: 1,
				Category: 'TRUNK',
				OriginCode: '65009',
				DestinationCode: '97009',
				AM_Peak_Freq: '10-12',
				AM_Offpeak_Freq: '10-12',
				PM_Peak_Freq: '10-12',
				PM_Offpeak_Freq: '15-10',
				LoopDesc: ''
			}]
		});
	else callback({value: []});
};
