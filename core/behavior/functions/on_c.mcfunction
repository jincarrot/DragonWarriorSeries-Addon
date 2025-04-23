tickingarea add 30000 150 30000 30159 264 30159 alaida1 true
tickingarea add 30000 150 30160 30159 264 30319 alaida2 true
tickingarea add 30160 150 30000 30319 264 30159 alaida3 true
tickingarea add 30160 150 30160 30319 264 30319 alaida4 true
tp @s 30000 150 30000
effect @s levitation 20
effect @s blindness 40
scoreboard objectives add door dummy
gamerule commandblockoutput false
schedule on_area_loaded add tickingarea alaida1 detect1