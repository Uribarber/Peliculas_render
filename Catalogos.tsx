
import React, { useEffect, useRef, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const API = 'https://dummyjson.com/products';
const IMAGEN = 'https://dummyjson.com/image/70';

type Producto = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  local?: boolean;
};

export default function Catalogos() {
  const red = useNetInfo();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Formulario para agregar productos
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');

  // Formulario para editar productos
  const [productoEditar, setProductoEditar] =
    useState<Producto | null>(null);

  const [editarNombre, setEditarNombre] = useState('');
  const [editarPrecio, setEditarPrecio] = useState('');
  const [errorEdicion, setErrorEdicion] = useState('');

  // ID para productos agregados localmente
  const siguienteIdLocal = useRef(-1);

  // Verificar conexión
  const sinInternet =
    red.isConnected === false ||
    red.isInternetReachable === false;

  // Validar precios con máximo dos decimales
  const validarPrecio = (valor: string): number | null => {
    const texto = valor.trim().replace(',', '.');

    if (!/^\d+(\.\d{1,2})?$/.test(texto)) {
      return null;
    }

    const precio = Number(texto);

    if (!Number.isFinite(precio) || precio <= 0) {
      return null;
    }

    return precio;
  };

  const mostrarPrecio = (precio: number) =>
    `$${precio.toFixed(2)}`;

  // ==========================================
  // GET - CONSULTAR PRODUCTOS
  // ==========================================
  const cargarProductos = async () => {
    setCargando(true);
    setError('');
    setMensaje('');

    try {
      if (sinInternet) {
        throw new Error('Sin conexión');
      }

      const respuesta = await fetch(`${API}?limit=10`);

      if (!respuesta.ok) {
        throw new Error('Error al consultar productos');
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos.products)) {
        throw new Error('Respuesta incorrecta');
      }

      setProductos(datos.products);

      setMensaje('Productos cargados correctamente.');
    } catch (e) {
      setError(
        'No fue posible cargar los productos. ' +
        'Verifica tu conexión a Internet.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // ==========================================
  // POST - AGREGAR PRODUCTO
  // ==========================================
  const agregarProducto = async () => {
    const nombre = nuevoNombre.trim();
    const precio = validarPrecio(nuevoPrecio);

    if (!nombre) {
      setMensaje('⚠ Escribe el nombre del producto.');
      return;
    }

    if (precio === null) {
      setMensaje(
        '⚠ Ingresa un precio mayor a cero ' +
        'con máximo dos decimales.'
      );
      return;
    }

    if (sinInternet) {
      setMensaje('⚠ No hay conexión a Internet.');
      return;
    }

    setProcesando(true);
    setMensaje('');

    try {
      const respuesta = await fetch(`${API}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: nombre,
          price: precio,
        }),
      });

      if (!respuesta.ok) {
        throw new Error('Error en POST');
      }

      const creado = await respuesta.json();

      const productoNuevo: Producto = {
        id: siguienteIdLocal.current--,
        title: creado.title || nombre,
        price: Number(creado.price ?? precio),
        thumbnail: IMAGEN,
        local: true,
      };

      setProductos((anteriores) => [
        productoNuevo,
        ...anteriores,
      ]);

      setNuevoNombre('');
      setNuevoPrecio('');

      setMensaje(
        '✅ Producto agregado correctamente.'
      );
    } catch (e) {
      setMensaje(
        '❌ No se pudo agregar el producto.'
      );
    } finally {
      setProcesando(false);
    }
  };

  // ==========================================
  // DELETE - ELIMINAR PRODUCTO
  // ==========================================
  const eliminarProducto = async (producto: Producto) => {
    if (sinInternet) {
      setMensaje('⚠ No hay conexión a Internet.');
      return;
    }

    setProcesando(true);
    setMensaje('');

    try {
      // Los productos originales usan DELETE
      if (!producto.local) {
        const respuesta = await fetch(
          `${API}/${producto.id}`,
          { method: 'DELETE' }
        );

        if (!respuesta.ok) {
          throw new Error('Error en DELETE');
        }
      }

      setProductos((anteriores) =>
        anteriores.filter(
          (p) => p.id !== producto.id
        )
      );

      setMensaje(
        '✅ Producto eliminado correctamente.'
      );
    } catch (e) {
      setMensaje(
        '❌ No se pudo eliminar el producto.'
      );
    } finally {
      setProcesando(false);
    }
  };

  // ==========================================
  // ABRIR FORMULARIO DE EDICIÓN
  // ==========================================
  const abrirEditar = (producto: Producto) => {
    setProductoEditar(producto);
    setEditarNombre(producto.title);
    setEditarPrecio(String(producto.price));
    setErrorEdicion('');
  };

  const cerrarEditar = () => {
    if (procesando) return;

    setProductoEditar(null);
    setEditarNombre('');
    setEditarPrecio('');
    setErrorEdicion('');
  };

  // ==========================================
  // PUT - EDITAR NOMBRE Y PRECIO
  // ==========================================
  const guardarEdicion = async () => {
    if (!productoEditar) return;

    const nombre = editarNombre.trim();
    const precio = validarPrecio(editarPrecio);

    if (!nombre) {
      setErrorEdicion(
        'El nombre no puede estar vacío.'
      );
      return;
    }

    if (precio === null) {
      setErrorEdicion(
        'Ingresa un precio válido mayor a cero.'
      );
      return;
    }

    if (sinInternet) {
      setErrorEdicion(
        'No hay conexión a Internet.'
      );
      return;
    }

    setProcesando(true);
    setErrorEdicion('');

    try {
      let nombreFinal = nombre;
      let precioFinal = precio;

      // En productos de la API, utilizar PUT
      if (!productoEditar.local) {
        const respuesta = await fetch(
          `${API}/${productoEditar.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: nombre,
              price: precio,
            }),
          }
        );

        if (!respuesta.ok) {
          throw new Error('Error en PUT');
        }

        const actualizado = await respuesta.json();

        nombreFinal = actualizado.title;
        precioFinal = Number(actualizado.price);
      }

      // Actualizar nombre y precio en pantalla
      setProductos((anteriores) =>
        anteriores.map((producto) =>
          producto.id === productoEditar.id
            ? {
                ...producto,
                title: nombreFinal,
                price: precioFinal,
              }
            : producto
        )
      );

      setProductoEditar(null);
      setEditarNombre('');
      setEditarPrecio('');

      setMensaje(
        '✅ Nombre y precio actualizados correctamente.'
      );
    } catch (e) {
      setErrorEdicion(
        'No se pudo actualizar el producto.'
      );
    } finally {
      setProcesando(false);
    }
  };

  // ==========================================
  // INTERFAZ DE LA APLICACIÓN
  // ==========================================
  return (
    <SafeAreaView style={styles.pantalla}>

      {/* ENCABEZADO */}
      <View style={styles.encabezado}>
        <View style={styles.encabezadoTexto}>
          <Text style={styles.titulo}>
            🛍 Mi Catálogo
          </Text>

          <Text style={styles.subtitulo}>
            Administración de productos con API REST
          </Text>
        </View>

        <Pressable
          style={styles.botonActualizar}
          onPress={cargarProductos}
          disabled={cargando || procesando}
        >
          <Text style={styles.iconoActualizar}>
            ↻
          </Text>
        </Pressable>
      </View>

      {/* AVISO DE SIN INTERNET */}
      {sinInternet && (
        <View style={styles.aviso}>
          <Text style={styles.textoAviso}>
            ⚠ Sin conexión a Internet
          </Text>

          <Text style={styles.detalleAviso}>
            Revisa tu WiFi o tus datos móviles.
          </Text>

          <Pressable
            style={styles.botonReintentar}
            onPress={cargarProductos}
          >
            <Text style={styles.textoBlanco}>
              ↻ Reintentar
            </Text>
          </Pressable>
        </View>
      )}

      {/* FORMULARIO AGREGAR */}
      <View style={styles.formulario}>
        <Text style={styles.tituloFormulario}>
          + Agregar nuevo producto
        </Text>

        <Text style={styles.label}>
          Nombre del producto
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ej. Laptop Lenovo"
          placeholderTextColor="#94A3B8"
          value={nuevoNombre}
          onChangeText={setNuevoNombre}
        />

        <Text style={styles.label}>
          Precio del producto ($)
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ej. 12500.50"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          value={nuevoPrecio}
          onChangeText={setNuevoPrecio}
        />

        <Pressable
          style={[
            styles.botonAgregar,
            procesando && styles.desactivado,
          ]}
          onPress={agregarProducto}
          disabled={procesando || cargando}
        >
          <Text style={styles.textoBlanco}>
            + Agregar producto
          </Text>
        </Pressable>
      </View>

      {/* MENSAJES */}
      {!!mensaje && (
        <View style={styles.cajaMensaje}>
          <Text style={styles.textoMensaje}>
            {mensaje}
          </Text>
        </View>
      )}

      {/* CONTADOR */}
      <View style={styles.filaSeccion}>
        <Text style={styles.tituloSeccion}>
          Productos disponibles
        </Text>

        <Text style={styles.contador}>
          {productos.length} productos
        </Text>
      </View>

      {/* MOSTRAR PRODUCTOS */}
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.mensaje}>
            Cargando productos...
          </Text>
        </View>
      ) : error && productos.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.textoError}>
            {error}
          </Text>

          <Pressable
            style={styles.botonReintentar}
            onPress={cargarProductos}
          >
            <Text style={styles.textoBlanco}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          refreshing={cargando}
          onRefresh={cargarProductos}
          ListEmptyComponent={
            <Text style={styles.mensaje}>
              No hay productos disponibles.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>

              {/* INFORMACIÓN DEL PRODUCTO */}
              <View style={styles.filaProducto}>
                <Image
                  source={{
                    uri: item.thumbnail || IMAGEN,
                  }}
                  style={styles.imagen}
                />

                <View style={styles.info}>
                  <Text style={styles.idProducto}>
                    PRODUCTO #{item.id}
                  </Text>

                  <Text style={styles.nombre}>
                    {item.title}
                  </Text>

                  <Text style={styles.precio}>
                    {mostrarPrecio(item.price)}
                  </Text>

                  {item.local && (
                    <Text style={styles.local}>
                      Producto agregado
                    </Text>
                  )}
                </View>
              </View>

              {/* BOTONES DE ACCIÓN */}
              <View style={styles.botones}>
                <Pressable
                  style={[
                    styles.botonEditar,
                    (procesando || sinInternet) &&
                      styles.desactivado,
                  ]}
                  onPress={() => abrirEditar(item)}
                  disabled={procesando || sinInternet}
                >
                  <Text style={styles.textoEditar}>
                    ✎ Editar
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.botonEliminar,
                    (procesando || sinInternet) &&
                      styles.desactivado,
                  ]}
                  onPress={() => eliminarProducto(item)}
                  disabled={procesando || sinInternet}
                >
                  <Text style={styles.textoEliminar}>
                    🗑 Eliminar
                  </Text>
                </Pressable>
              </View>

            </View>
          )}
        />
      )}

      {/* MODAL PARA EDITAR */}
      <Modal
        visible={productoEditar !== null}
        transparent
        animationType="fade"
        onRequestClose={cerrarEditar}
      >
        <View style={styles.fondoModal}>
          <View style={styles.modal}>

            <Text style={styles.tituloModal}>
              ✎ Editar producto
            </Text>

            <Text style={styles.descripcionModal}>
              Modifica el nombre y el precio.
            </Text>

            <Text style={styles.label}>
              Nombre del producto
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del producto"
              value={editarNombre}
              onChangeText={setEditarNombre}
            />

            <Text style={styles.label}>
              Precio del producto ($)
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Precio del producto"
              keyboardType="decimal-pad"
              value={editarPrecio}
              onChangeText={setEditarPrecio}
            />

            {!!errorEdicion && (
              <Text style={styles.textoError}>
                {errorEdicion}
              </Text>
            )}

            <Pressable
              style={[
                styles.botonAgregar,
                procesando && styles.desactivado,
              ]}
              onPress={guardarEdicion}
              disabled={procesando}
            >
              <Text style={styles.textoBlanco}>
                {procesando
                  ? 'Guardando...'
                  : 'Guardar cambios (PUT)'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.botonCancelar}
              onPress={cerrarEditar}
              disabled={procesando}
            >
              <Text style={styles.textoCancelar}>
                Cancelar
              </Text>
            </Pressable>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ==========================================
// ESTILOS
// ==========================================
const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 16,
  },

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  encabezadoTexto: {
    flex: 1,
  },

  titulo: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  botonActualizar: {
    backgroundColor: '#DBEAFE',
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconoActualizar: {
    fontSize: 28,
    color: '#2563EB',
  },

  aviso: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  textoAviso: {
    color: '#92400E',
    fontWeight: 'bold',
    fontSize: 14,
  },

  detalleAviso: {
    color: '#92400E',
    fontSize: 12,
    marginTop: 5,
  },

  botonReintentar: {
    backgroundColor: '#D97706',
    borderRadius: 9,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },

  formulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 13,
  },

  tituloFormulario: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 13,
  },

  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    color: '#0F172A',
    fontSize: 15,
    borderRadius: 9,
    padding: 12,
    marginBottom: 13,
  },

  botonAgregar: {
    backgroundColor: '#2563EB',
    borderRadius: 9,
    padding: 14,
    alignItems: 'center',
  },

  textoBlanco: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  desactivado: {
    opacity: 0.5,
  },

  cajaMensaje: {
    backgroundColor: '#DBEAFE',
    borderRadius: 9,
    padding: 12,
    marginBottom: 12,
  },

  textoMensaje: {
    color: '#1E40AF',
    textAlign: 'center',
    fontSize: 13,
  },

  filaSeccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  tituloSeccion: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: 'bold',
  },

  contador: {
    fontSize: 12,
    color: '#64748B',
  },

  lista: {
    paddingBottom: 35,
    gap: 12,
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
  },

  filaProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  imagen: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    resizeMode: 'contain',
  },

  info: {
    flex: 1,
    paddingLeft: 14,
  },

  idProducto: {
    color: '#94A3B8',
    fontSize: 10,
    marginBottom: 6,
    fontWeight: 'bold',
  },

  nombre: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 9,
  },

  precio: {
    color: '#2563EB',
    fontSize: 20,
    fontWeight: 'bold',
  },

  local: {
    color: '#16A34A',
    fontSize: 11,
    marginTop: 5,
  },

  botones: {
    flexDirection: 'row',
    gap: 10,
  },

  botonEditar: {
    backgroundColor: '#DBEAFE',
    flex: 1,
    borderRadius: 9,
    padding: 12,
    alignItems: 'center',
  },

  textoEditar: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },

  botonEliminar: {
    backgroundColor: '#FEE2E2',
    flex: 1,
    borderRadius: 9,
    padding: 12,
    alignItems: 'center',
  },

  textoEliminar: {
    color: '#DC2626',
    fontWeight: 'bold',
  },

  centro: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 12,
  },

  mensaje: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
  },

  textoError: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
  },

  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modal: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 420,
    borderRadius: 17,
    padding: 22,
  },

  tituloModal: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 7,
  },

  descripcionModal: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 20,
  },

  botonCancelar: {
    backgroundColor: '#E2E8F0',
    borderRadius: 9,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  textoCancelar: {
    color: '#334155',
    fontWeight: 'bold',
  },
});
