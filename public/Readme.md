# 2.🤖 Programanji: Criptografía

## Recordatorio

Puedes utilizar funciones de un módulo que te entregó alguien como archivo o descargas de la web. Por ejemplo, si te entregaron un módulo saludar que contiene las funciones ingles(), fines(), espanol(), donde cada una retorna el saludo en ese idioma, debes hacer lo siguiente:

```python
import saludar

# Llamamos cada función del módulo
# y guardamos los valores retornados en varibles
saludo_ingles = saludar.ingles()
saludo_fines = saludar.fines()
saludo_espanol = saludar.espanol()

print(saludo_espanol)
```

Si te fijas, funciona muy similar a como importamos librerías de Python. En primer lugar, lo importamos y luego para utilizar las funciones utilizamos el nombre del módulo seguido de un punto, y el nombre de la función más los parámetros que necesitemos entre paréntesis, que en este ejemplo no reciben ningún parámetro.

## Introducción

Luego de tirar los dados, fuiste teletransportado a un lugar desconocido. Al llegar se te acercaron muchos nativos de la zona ofreciéndote ayuda para encontrar una forma de salir 😲. Te indicaron que la respuesta a cómo salir de Programanji la tiene el hechicero George Muñoz, que vive en el legendario bosque geométrico.

Mientras caminabas por el bosque te encuentras un libro rojo y grande titulado "Make intro a la progra great again". Intrigado empiezas a leer el libro, pero la información se encuentra codificada. Por suerte, el libro al final viene con instrucciones para decodificar la información y descubrir qué planea Peachy Head y quizá finalmente encontrar al hechicero George Muñoz.

## Objetivo

Tu objetivo es decodificar la información encontrada en el libro para que sea entendible por humanos. Para ayudarte en esta labor se te entregará el módulo cripto, el cual contiene las siguientes funciones:

decodificado_peachy(mensaje): Recibe como parámetro el string mensaje el cual se encuentra codificado y retorna un entero correspondiente a una página del libro rojo. Importante: Esta función es mágica, por lo que si la llamas más de una vez su maná se acabará y te entregará números de páginas erróneos.

decodificado_progra(numero): Recibe como parámetro el entero numero, el cual corresponde a una página del libro rojo, y retorna un string que corresponde al mensaje final.

Recibirás un string correspondiente al mensaje a decodificar, el cual deberás ingresar en la función decodificado_peachy, imprimir el entero retornado por la función, para luego ingresar este entero en la función decodificado_progra e imprimir finalmente el string retornado por esta función que corresponde al mensaje final.

## Input Format

Recibirás una línea correspondiente al mensaje que debe ser decodificado.

## Constraints

- El input recibido siempre será un string.

- La función decodificado_peachy siempre recibirá como parámetro un string y retornará un entero.

- La función decodificado_progra siempre recibirá como parámetro un número y retornará un string.

## Output Format

Dos líneas, donde la primera línea será un entero retornado por la función decodificado_peachy, y la segunda línea será un string retornado por la función decodificado_progra.

## Ejemplos

Input Test Case 00
~~~html
miaumiau
~~~
Output Test Case 00
~~~html
9999
El hechicero te hara combatir..
~~~

Explicación: El número 9999 corresponde a imprimir lo retornado por decodificado_peachy("miaumiau"), y el string "El hechicero te hara combatir.." corresponde a imprimir lo retornado por decodificado_progra(9999).
