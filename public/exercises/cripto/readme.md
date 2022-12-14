# 2.馃 Programanji: Criptograf铆a

## Recordatorio

Puedes utilizar funciones de un m贸dulo que te entreg贸 alguien como archivo o descargas de la web. Por ejemplo, si te entregaron un m贸dulo saludar que contiene las funciones ingles(), fines(), espanol(), donde cada una retorna el saludo en ese idioma, debes hacer lo siguiente:

```python
import saludar

# Llamamos cada funci贸n del m贸dulo
# y guardamos los valores retornados en varibles
saludo_ingles = saludar.ingles()
saludo_fines = saludar.fines()
saludo_espanol = saludar.espanol()

print(saludo_espanol)
```

Si te fijas, funciona muy similar a como importamos librer铆as de Python. En primer lugar, lo importamos y luego para utilizar las funciones utilizamos el nombre del m贸dulo seguido de un punto, y el nombre de la funci贸n m谩s los par谩metros que necesitemos entre par茅ntesis, que en este ejemplo no reciben ning煤n par谩metro.

## Introducci贸n

Luego de tirar los dados, fuiste teletransportado a un lugar desconocido. Al llegar se te acercaron muchos nativos de la zona ofreci茅ndote ayuda para encontrar una forma de salir 馃槻. Te indicaron que la respuesta a c贸mo salir de Programanji la tiene el hechicero George Mu帽oz, que vive en el legendario bosque geom茅trico.

Mientras caminabas por el bosque te encuentras un libro rojo y grande titulado "Make intro a la progra great again". Intrigado empiezas a leer el libro, pero la informaci贸n se encuentra codificada. Por suerte, el libro al final viene con instrucciones para decodificar la informaci贸n y descubrir qu茅 planea Peachy Head y quiz谩 finalmente encontrar al hechicero George Mu帽oz.

## Objetivo

Tu objetivo es decodificar la informaci贸n encontrada en el libro para que sea entendible por humanos. Para ayudarte en esta labor se te entregar谩 el m贸dulo cripto, el cual contiene las siguientes funciones:

decodificado_peachy(mensaje): Recibe como par谩metro el string mensaje el cual se encuentra codificado y retorna un entero correspondiente a una p谩gina del libro rojo.聽Importante: Esta funci贸n es m谩gica, por lo que si la llamas m谩s de una vez su man谩 se acabar谩 y te entregar谩 n煤meros de p谩ginas err贸neos.

decodificado_progra(numero): Recibe como par谩metro el entero numero, el cual corresponde a una p谩gina del libro rojo, y retorna un string que corresponde al mensaje final.

Recibir谩s un string correspondiente al mensaje a decodificar, el cual deber谩s ingresar en la funci贸n decodificado_peachy, imprimir el entero retornado por la funci贸n, para luego ingresar este entero en la funci贸n decodificado_progra e imprimir finalmente el string retornado por esta funci贸n que corresponde al mensaje final.

## Input Format

Recibir谩s una l铆nea correspondiente al mensaje que debe ser decodificado.

## Constraints

- El input recibido siempre ser谩 un string.

- La funci贸n decodificado_peachy siempre recibir谩 como par谩metro un string y retornar谩 un entero.

- La funci贸n decodificado_progra siempre recibir谩 como par谩metro un n煤mero y retornar谩 un string.

## Output Format

Dos l铆neas, donde la primera l铆nea ser谩 un entero retornado por la funci贸n decodificado_peachy,聽y la segunda l铆nea ser谩 un string retornado por la funci贸n decodificado_progra.

## Ejemplos

Input Test Case 00

```html
miaumiau
```

Output Test Case 00

```html
9999 El hechicero te hara combatir..
```

Explicaci贸n: El n煤mero 9999 corresponde a imprimir lo retornado por decodificado_peachy("miaumiau"), y el string "El hechicero te hara combatir.." corresponde a imprimir lo retornado por decodificado_progra(9999).
