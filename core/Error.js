class ScheduleGenerateError extends Error{
    constructor(...params){
        super(...params);
        this.name = 'ScheduleGenerateError'
    }
}
module.exports = {
    ScheduleGenerateError
}
