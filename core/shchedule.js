const Moment = require('moment');
const Error = require('./Error')



class Schedule{
  constructor(){
    this.MAX_PLAN_COUNT = 365;

    this.beginDate = Moment(); //计划启动时间
    this.endDate = Moment(); // 计划结束时间
    this.nextDate = Moment(); // 下次触发时间
    this.trigger = null;
    this.interval = null // 触发间隔
    /**
     * 触发内容使用模板字符串提供对象
     *  const N = { \n
     *  d:triggerMonemt.days(), 该计划处时间
     *  h:triggerMonemt.hours(),
     *  m:triggerMonemt.minutes(),
     *  s:triggerMonemt.seconds(),
     *  now:Moment().format(), 当前时间
     *  i: index + 1, 该计划序列号以1为起点
     *  end: index === self.length - 1 ? true : false 是否是最后一个计划的标志(bool)
    *  }
     * 
     */
    this.attachText = '`no attach`'; //触发内容
  }
  range(rule=''){ // +1d
    const years = rule.match(/([0-9]+)y/) ? parseInt(rule.match(/([0-9]+)y/)[1], 10) : 0;
    const months = rule.match(/([0-9]+)M/) ? parseInt(rule.match(/([0-9]+)M/)[1], 10) : 0;
    const days = rule.match(/([0-9]+)d/) ? parseInt(rule.match(/([0-9]+)d/)[1], 10) : 0;
    const hours = rule.match(/([0-9]+)h/) ? parseInt(rule.match(/([0-9]+)h/)[1], 10) : 0;
    const minutes = rule.match(/([0-9]+)m/) ? parseInt(rule.match(/([0-9]+)m/)[1], 10) : 0;
    const seconds = rule.match(/([0-9]+)s/) ? parseInt(rule.match(/([0-9]+)s/)[1], 10) : 0;
    this.endDate.add({
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
    });
    return this;
  }

  after(rule=''){
    return this.range(rule);
  }

  at(rule=''){
    const date = Moment(rule, "k mm");
    if(!date.isValid()){
      throw new Error.ScheduleGenerateError('wrong at')
    }
    const hours = date.hour();
    const minutes = date.minute();
    this.trigger = Moment.duration({
      hours,
      minutes,
    })
    if(this.interval === null){
      this.interval = Moment.duration(1, 'days');
    }
    return this;
  }
  // intval
  every(rule){
    const years = rule.match(/([0-9]+)y/) ? parseInt(rule.match(/([0-9]+)y/)[1], 10) : 0;
    const months = rule.match(/([0-9]+)M/) ? parseInt(rule.match(/([0-9]+)M/)[1], 10) : 0;
    const days = rule.match(/([0-9]+)d/) ? parseInt(rule.match(/([0-9]+)d/)[1], 10) : 0;
    const hours = rule.match(/([0-9]+)h/) ? parseInt(rule.match(/([0-9]+)h/)[1], 10) : 0;
    const minutes = rule.match(/([0-9]+)m/) ? parseInt(rule.match(/([0-9]+)m/)[1], 10) : 0;
    const seconds = rule.match(/([0-9]+)s/) ? parseInt(rule.match(/([0-9]+)s/)[1], 10) : 0;
    this.interval = Moment.duration({
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
    })
    if(this.trigger === null){
      this.trigger = Moment(this.beginDate);
    }
    return this;
  }

  // action
  warn(){
   const triggers = this.getAllTriggerDate();
   if(triggers.length === 0){
    throw new Error.ScheduleGenerateError('没有生成计划，请检查设置');
   }
   triggers.forEach((triggerMonemt, index, self) => {
    const intval = parseInt(triggerMonemt.format('x')) - parseInt(this.beginDate.format('x'))
    const N = {
      d:triggerMonemt.days(),
      h:triggerMonemt.hours(),
      m:triggerMonemt.minutes(),
      s:triggerMonemt.seconds(),
      now:Moment().format(),
      i: index + 1,
      end: index === self.length - 1 ? true : false
    }
    const getAttachText = new Function('N', 'text', 'return eval(text)');
      const text = getAttachText(N, this.attachText);
      setTimeout(()=>{
        console.log(text)
      }, intval)
   });
  }
  attach(text){
    this.attachText = `\`${text}\``;
    return this;
  }

  getAllTriggerDate(){
    const begin = this.beginDate;
    const end = this.endDate;
    const milliseconds = parseInt(this.endDate.format('x')) - parseInt(this.beginDate.format('x'));
    if(milliseconds / this.interval.asMilliseconds() > this.MAX_PLAN_COUNT){
      throw new Error.ScheduleGenerateError('生成的计划的数量太多，已经被取消')
    }
    const temp = Moment(begin).set({
      minute: this.trigger.minutes(),
      hour: this.trigger.hours(),
      second:this.trigger.seconds(),
    })
    const triggers = [];
    while(temp.isSameOrBefore(end)){
      if( temp.isAfter(begin) ){
        triggers.push(Moment(temp));
      }
      temp.add(this.interval)
    }
    return triggers;
  }
}


const she = new Schedule();
// she.range('+2d').at('13:55').attach('这是第${N.i}条消息').warn();
// console.log(she.range('+20d').at('18:55').getAllTriggerDate())
// 在固定时间
// she.range('+20d').at('17:31').attach('这是第${N.i}条消息').warn()
// 定时器
//she.range('+10s').every('1m').attach('这是第${N.i}条消息${N.end ? ",并且计划结束了" : ""}').warn()
// she.range('+20d').at('17:31').attach('这是第${N.i}条消息').warn()
// she.range('+20d').at('17:31').attach('这是第${N.i}条消息').warn()
