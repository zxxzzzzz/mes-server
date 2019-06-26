const moment = require('moment');

class Schedule{
  constructor(){
    this.beginDate = moment();
    this.endDate = moment();
    this.trigger = {
      hour:-1,
      minute:-1,
      second:-1,
      day:-1,
    }
    this.interval = {
      hour:-1,
      minute:-1,
      second:-1,
      day:-1,
    }
    this.attachText = 'no attach';
  }
  range(rule=''){
    const num = parseInt(rule.slice(1, -1));
    const type = rule.slice(-1)[0]
    if(rule === ''){
      throw new Error('wrong range')
    }
    if(rule[0] !== '+'){
      throw new Error('wrong range')
    }
    if(!'dhm'.includes(type)){
      throw new Error('wrong range')
    }
    if(Number.isNaN(num)){
      throw new Error('wrong range')
    }
    this.endDate.add(num, type);
    return this;
  }

  after(rule=''){
    const num = parseInt(rule.slice(1, -1));
    const type = rule.slice(-1)[0]
    if(rule = ''){
      throw new Error('wrong range')
    }
    if(rule[0] != '+'){
      throw new Error('wrong range')
    }
    if(!'dhm'.includes(type)){
      throw new Error('wrong range')
    }
    if(Number.isNaN(num)){
      throw new Error('wrong range')
    }
    this.endDate.add(num, type);
    return this;
  }

  at(rule=''){
    const date = moment(rule, "hmm");
    if(!date.isValid()){
      throw new Error('wrong at')
    }
    const hour = date.hour();
    const minute = date.minute();
    this.trigger.hour = hour;
    this.trigger.minute = minute;
    return this;
  }
  // intval
  every(rule){
    const num = parseInt(rule.slice(0, -1));
    const type = rule.slice(-1);
    if(type === 'd'){
      this.interval.day = num;
    }
    if(type === 'h'){
      this.interval.hour = num;
    }
    if(type === 'm'){
      this.interval.minute = num;
    }
    if(type === 's'){
      this.interval.second = num;
    }
    return this;
  }

  // action
  warn(){
    const currentDate = moment(parseInt(this.beginDate.format('x')))
    let num = -1;
    let type = '';
    if(this.interval.day !== -1){
      num =  this.interval.day
      type = 'days'
    }
    if(this.interval.hour !== -1){
      num =  this.interval.hour
      type = 'hours'
    }
    if(this.interval.minute !== -1){
      num =  this.interval.minute
      type = 'minutes'
    }
    if(this.interval.second !== -1){
      num =  this.interval.second
      type = 'seconds'
    }
    let index = 0;
    while(currentDate.add(num, type).isBefore(this.endDate)){
      const intval = parseInt(currentDate.format('x')) - parseInt(this.beginDate.format('x'))
      index += 1;
      const N = {
        d:currentDate.days(),
        h:currentDate.hours(),
        m:currentDate.minutes(),
        s:currentDate.seconds(),
        i: index
      }
      const getAttachText = new Function('N', 'text', 'return eval(text)');
      const text = getAttachText(N, this.attachText);
      setTimeout(()=>{
        console.log(text)
      }, intval)
    }
  }
  attach(text){
    this.attachText = `\`${text}\``;
    return this;
  }
}


const she = new Schedule();
she.range('+1m').every('1s').attach('这是第${N.i}条消息').warn();
