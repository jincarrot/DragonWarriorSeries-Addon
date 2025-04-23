// LiteLoader-AIDS automatic generated
/// <reference path="d:/lllib/dts/helperlib/src/index.d.ts"/> 

//任务系统

let config = new JsonConfigFile('plugins/adventure/config.json', '{"tasks": []}');
let pl = new JsonConfigFile('plugins/adventure/pl.json');
let elements = ['gold', 'tree', 'water', 'fire', 'earth', 'light']

function cmd() {
    let task = mc.newCommand('task', '打开成就系统界面', PermType.Any);
    task.overload([]);
    task.setCallback((cmd, ori, out, res) => {
        if (ori.player) {
            let player = ori.player;
            let form = mc.newSimpleForm();
            form.setTitle('成就系统');
            form.setContent('');
            for (let task of config.get('tasks')) {
                form.addButton(task['name'], task['texture']);//
            }
            player.sendForm(form, (player, id) => {
                form = mc.newSimpleForm();
                form.setContent(config.get('tasks')[id]['info']);
                player.sendForm(form, () => { });
            })
        }
        else out.error('必须由玩家执行命令！');
    })
    task.setup();
}

class Task {
    id;
    data;
    constructor(data, id) {
        this.id = id;
        this.data = data;
        eval(`this.${data['condition']}`);
    }

    achieve(player) {
        let data = pl.get(player.name);
        data['locked'].push(this.id);
        pl.set(player.name, data);
        player.sendToast('', `你解锁了成就 ${this.data.name}`);

    }

    kill(condition, target) {
        mc.listen('onMobDie', (mob, cause) => {
            if (cause.isPlayer()) {
                //player killed this mob
                target = typeof target == 'object' ? target : [target];
                if (!pl.get(cause.name)) {
                    //init config
                    let data = {
                        'locked': []
                    }
                    pl.set(cause.name, data)
                }
                if (pl.get(cause.name)['locked'].indexOf(this.id) < 0 && target.indexOf(mob.type) >= 0) {
                    //unlock
                    switch (condition) {
                        case 'any of':
                            this.achieve(cause);
                            break;
                        case 'all of':
                            var progress = pl.get(cause.name)[this.id];
                            if (progress) {
                                progress = new Set(progress);
                                progress.add(mob.type);
                            }
                            else progress = [mob.type];
                            progress = Array.from(progress);
                            var data = pl.get(cause.name);
                            data[this.id] = progress;
                            pl.set(cause.name, data)
                            if (progress.length >= target.length) this.achieve(cause);
                            break;
                        default:
                            let num = Number(condition.split(' ')[0]);
                            var progress = pl.get(cause.name)[this.id];
                            if (progress) {
                                progress = new Set(progress);
                                progress.add(mob.type);
                            }
                            else progress = [mob.type];
                            progress = Array.from(progress);
                            var data = pl.get(cause.name);
                            data[this.id] = progress;
                            pl.set(cause.name, data)
                            if (progress.length >= num) this.achieve(cause);
                            break;
                    }
                }
            }
        })
    }

    gain(condition, target) {
        mc.listen('onInventoryChange', (player, s, o, item) => {
            target = typeof target == 'object' ? target : [target];
            if (!pl.get(player.name)) {
                //init config
                let data = {
                    'locked': []
                }
                pl.set(player.name, data)
            }
            if (pl.get(player.name)['locked'].indexOf(this.id) < 0 && target.indexOf(item.type) >= 0) {
                //unlock
                switch (condition) {
                    case 'any of':
                        this.achieve(player);
                        break;
                    case 'all of':
                        var progress = pl.get(player.name)[this.id] || 1;
                        if (progress) {
                            progress = new Set(progress);
                            progress.add(item.type);
                        }
                        else progress = [item.type];
                        progress = Array.from(progress);
                        var data = pl.get(player.name);
                        data[this.id] = progress;
                        pl.set(player.name, data)
                        if (progress.length >= target.length) this.achieve(player);
                        break;
                    default:
                        let num = Number(condition.split(' ')[0]);
                        var progress = pl.get(player.name)[this.id] || 1;
                        if (progress) {
                            progress = new Set(progress);
                            progress.add(item.type);
                        }
                        else progress = [item.type];
                        progress = Array.from(progress);
                        var data = pl.get(player.name);
                        data[this.id] = progress;
                        pl.set(player.name, data)
                        if (progress.length >= num) this.achieve(player);
                        break;
                }
            }
        })
    }

    cumulate(condition, target) {
        mc.listen('onMobDie', (mob, cause) => {
            if (cause.isPlayer()) {
                //player killed this mob
                target = typeof target == 'object' ? target : [target];
                if (!pl.get(cause.name)) {
                    //init config
                    let data = {
                        'locked': []
                    }
                    pl.set(cause.name, data)
                }
                if (pl.get(cause.name)['locked'].indexOf(this.id) < 0 && target.indexOf(mob.type)) {
                    //unlock
                    let amount = Number(condition);
                    let progress = pl.get(cause.name)[this.id];
                    progress += 1;
                    let data = pl.get(cause.name);
                    data[this.id] = progress;
                    pl.set(cause.name, data)
                    if (progress >= amount) this.achieve(cause);
                }
            }
        })
    }

    collect(condition, target) {
        mc.listen('onInventoryChange', (player, s, o, item) => {
            target = typeof target == 'object' ? target : [target];
            if (!pl.get(player.name)) {
                //init config
                let data = {
                    'locked': []
                }
                pl.set(player.name, data)
            }
            if (pl.get(player.name)['locked'].indexOf(this.id) < 0 && target.indexOf(item.type) >= 0) {
                //unlock
                if (item.lore[0]?.indexOf(`§${this.id}`) >= 0) return;
                let amount = Number(condition);
                let progress = pl.get(player.name)[this.id] || 1;
                progress += item.count;
                let data = pl.get(player.name);
                data[this.id] = progress;
                pl.set(player.name, data)
                if (progress >= amount) this.achieve(player);
                item.setLore([item.lore[0] + `§${this.id}`]);
                player.refreshItems();
            }
        })
    }

    join() {
        mc.listen('onJoin', (player) => {
            if (!pl.get(player.name)) {
                //init config
                let data = {
                    'locked': []
                }
                pl.set(player.name, data)
            }
            if (pl.get(player.name)['locked'].indexOf(this.id) < 0) {
                this.achieve(player);
            }
        })
    }

    use(condition, target) {
        mc.listen('onUseItem', (player, item) => {
            target = typeof target == 'object' ? target : [target];
            if (!pl.get(player.name)) {
                //init config
                let data = {
                    'locked': []
                }
                pl.set(player.name, data)
            }
            if (pl.get(player.name)['locked'].indexOf(this.id) < 0 && target.indexOf(item.type) >= 0) {
                //unlock
                switch (condition) {
                    case 'any of':
                        this.achieve(player);
                        break;
                    case 'all of':
                        var progress = pl.get(player.name)[this.id] || 1;
                        if (progress) {
                            progress = new Set(progress);
                            progress.add(item.type);
                        }
                        else progress = [item.type];
                        progress = Array.from(progress);
                        var data = pl.get(player.name);
                        data[this.id] = progress;
                        pl.set(player.name, data)
                        if (progress.length >= target.length) this.achieve(player);
                        break;
                    default:
                        let num = Number(condition.split(' ')[0]);
                        var progress = pl.get(player.name)[this.id] || 1;
                        if (progress) {
                            progress = new Set(progress);
                            progress.add(item.type);
                        }
                        else progress = [item.type];
                        progress = Array.from(progress);
                        var data = pl.get(player.name);
                        data[this.id] = progress;
                        pl.set(player.name, data)
                        if (progress.length >= num) this.achieve(player);
                        break;
                }
            }
        })
    }
}

function main() {
    cmd();
    let tasks = config.get('tasks');
    for (let i = 0; i < tasks.length; i++) {
        new Task(tasks[i], i);
    }
}

function getColor(player) {
    let nbt = player.getNbt();
    let color = nbt.getTag('DynamicProperties').toObject()['2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e']['color'] || 'w';
    return color;
}



main();