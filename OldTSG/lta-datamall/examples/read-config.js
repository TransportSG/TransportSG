module.exports = () => {
	return JSON.parse(require('fs').readFileSync(__dirname + '/config.json')).accountKey
}
