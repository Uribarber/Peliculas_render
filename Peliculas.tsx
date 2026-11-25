
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

const API_URL = 'https://reactnative.dev/movies.json';

// Estructura de cada película de la API
type Pelicula = {
  id: string;
  title: string;
  releaseYear: string;
};

type RespuestaAPI = {
  title: string;
  description: string;
  movies: Pelicula[];
};

// Configuración visual de las películas
const estilosPeliculas: Record<
  string,
  { color: string; fondo: string; icono: string; subtitulo: string }
> = {
  '1': {
    color: '#F9C45E',
    fondo: '#302310',
    icono: '✦',
    subtitulo: 'UNA GALAXIA MUY LEJANA',
  },
  '2': {
    color: '#FF9969',
    fondo: '#30231D',
    icono: '⚡',
    subtitulo: 'EL FUTURO TE ESPERA',
  },
  '3': {
    color: '#6EE7B7',
    fondo: '#0C2925',
    icono: '01',
    subtitulo: 'DESCUBRE LA REALIDAD',
  },
  '4': {
    color: '#9AC5FF',
    fondo: '#142842',
    icono: '◈',
    subtitulo: 'EXPLORA LOS SUEÑOS',
  },
  '5': {
    color: '#BCCBFF',
    fondo: '#111A35',
    icono: '◎',
    subtitulo: 'MÁS ALLÁ DEL UNIVERSO',
  },
};

const filtros = [
  { id: 'todos', nombre: 'Todas' },
  { id: 'clasicas', nombre: '1970 - 1989' },
  { id: 'noventas', nombre: '1990 - 2009' },
  { id: 'modernas', nombre: '2010+' },
];

export default function peliculas() {
  const { width } = useWindowDimensions();
  const esEscritorio = width >= 700;
  const columnas = esEscritorio ? 3 : 2;

  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');
  const [seleccionada, setSeleccionada] =
    useState<Pelicula | null>(null);

  // Conexión a la API externa
  const obtenerPeliculas = async (refrescar = false) => {
    try {
      if (refrescar) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError('');

      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error('Error al consultar la API');
      }

      const datos: RespuestaAPI = await respuesta.json();

      if (!Array.isArray(datos.movies)) {
        throw new Error('Respuesta JSON inválida');
      }

      setPeliculas(datos.movies);
    } catch (err) {
      setError('No se pudieron obtener las películas.');
      Alert.alert('Error', 'Verifica tu conexión a Internet.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  // Consultar la API al abrir la aplicación
  useEffect(() => {
    obtenerPeliculas();
  }, []);

  // Filtrar películas por título y año
  const peliculasFiltradas = peliculas.filter((p) => {
    const coincideBusqueda = p.title
      .toLowerCase()
      .includes(busqueda.toLowerCase().trim());

    const anio = Number(p.releaseYear);

    let coincideFiltro = true;

    if (filtro === 'clasicas') {
      coincideFiltro = anio >= 1970 && anio <= 1989;
    } else if (filtro === 'noventas') {
      coincideFiltro = anio >= 1990 && anio <= 2009;
    } else if (filtro === 'modernas') {
      coincideFiltro = anio >= 2010;
    }

    return coincideBusqueda && coincideFiltro;
  });

  const destacada = peliculas.find((p) => p.id === '5');

  // Representación visual de una película
  const obtenerEstilo = (id: string) =>
    estilosPeliculas[id] || {
      color: '#FFFFFF',
      fondo: '#293244',
      icono: '🎬',
      subtitulo: 'PELÍCULA',
    };

  const Poster = ({
    pelicula,
    grande = false,
  }: {
    pelicula: Pelicula;
    grande?: boolean;
  }) => {
    const tema = obtenerEstilo(pelicula.id);

    return (
      <View
        style={[
          styles.poster,
          {
            backgroundColor: tema.fondo,
            height: grande ? 230 : esEscritorio ? 245 : 205,
          },
        ]}
      >
        <View
          style={[
            styles.circuloExterior,
            { borderColor: tema.color + '33' },
          ]}
        >
          <View
            style={[
              styles.circuloInterior,
              { borderColor: tema.color + '66' },
            ]}
          >
            <Text
              style={[
                styles.iconoPoster,
                { color: tema.color },
              ]}
            >
              {tema.icono}
            </Text>
          </View>
        </View>

        <View style={styles.posterInferior}>
          <Text
            style={[
              styles.tituloPoster,
              { color: tema.color },
            ]}
            numberOfLines={2}
          >
            {pelicula.title.toUpperCase()}
          </Text>

          <Text style={styles.frasePoster}>
            {tema.subtitulo}
          </Text>

          <View
            style={[
              styles.lineaPoster,
              { backgroundColor: tema.color },
            ]}
          />
        </View>
      </View>
    );
  };

  // Tarjeta del catálogo
  const TarjetaPelicula = ({
    pelicula,
  }: {
    pelicula: Pelicula;
  }) => (
    <Pressable
      style={styles.tarjeta}
      onPress={() => setSeleccionada(pelicula)}
    >
      <Poster pelicula={pelicula} />

      <View style={styles.infoTarjeta}>
        <Text
          style={styles.tituloTarjeta}
          numberOfLines={1}
        >
          {pelicula.title}
        </Text>

        <View style={styles.filaTarjeta}>
          <Text style={styles.anioTarjeta}>
            {pelicula.releaseYear} · Película
          </Text>
          <Text style={styles.flecha}>↗</Text>
        </View>
      </View>
    </Pressable>
  );

  // Encabezado principal
  const Encabezado = () => (
    <View style={styles.contenidoSuperior}>
      <View style={styles.navbar}>
        <View style={styles.logoContenedor}>
          <Text style={styles.logoIcono}>▶</Text>
          <Text style={styles.logo}>
            CINE<Text style={styles.logoRojo}>MAX</Text>
          </Text>
        </View>

        <Pressable
          style={styles.botonRecargar}
          onPress={() => obtenerPeliculas(true)}
          disabled={cargando || actualizando}
        >
          <Text style={styles.iconoRecargar}>↻</Text>
          {esEscritorio && (
            <Text style={styles.textoRecargar}>
              Actualizar
            </Text>
          )}
        </Pressable>
      </View>

      {/* Película destacada */}
      {destacada && (
        <View
          style={[
            styles.destacada,
            esEscritorio && styles.destacadaHorizontal,
          ]}
        >
          <View style={styles.infoDestacada}>
            <Text style={styles.etiquetaDestacada}>
              ✦ PELÍCULA DESTACADA
            </Text>

            <Text style={styles.tituloDestacada}>
              {destacada.title.toUpperCase()}
            </Text>

            <Text style={styles.metaDestacada}>
              {destacada.releaseYear}   •   Película
            </Text>

            <Text style={styles.descripcionDestacada}>
              Descubre historias inolvidables y explora
              nuestro catálogo de películas.
            </Text>

            <Pressable
              style={styles.botonPrincipal}
              onPress={() => setSeleccionada(destacada)}
            >
              <Text style={styles.textoPrincipal}>
                ▶  Ver detalles
              </Text>
            </Pressable>
          </View>

          <View style={styles.posterDestacado}>
            <Poster pelicula={destacada} grande />
          </View>
        </View>
      )}

      {/* Buscador */}
      <View style={styles.areaBusqueda}>
        <View style={styles.buscador}>
          <Text style={styles.iconoBuscar}>⌕</Text>

          <TextInput
            placeholder="Buscar una película..."
            placeholderTextColor="#7F899E"
            style={styles.input}
            value={busqueda}
            onChangeText={setBusqueda}
          />

          {busqueda.length > 0 && (
            <Pressable onPress={() => setBusqueda('')}>
              <Text style={styles.limpiar}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filtros por década */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosScroll}
        contentContainerStyle={styles.filtros}
      >
        {filtros.map((opcion) => (
          <Pressable
            key={opcion.id}
            onPress={() => setFiltro(opcion.id)}
            style={[
              styles.chip,
              filtro === opcion.id && styles.chipActivo,
            ]}
          >
            <Text
              style={[
                styles.textoChip,
                filtro === opcion.id &&
                  styles.textoChipActivo,
              ]}
            >
              {opcion.nombre}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.filaSeccion}>
        <View>
          <Text style={styles.tituloSeccion}>
            Explorar películas
          </Text>
          <Text style={styles.subtituloSeccion}>
            Nuestra colección de cine
          </Text>
        </View>

        <Text style={styles.contador}>
          {peliculasFiltradas.length} títulos
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.areaPrincipal}>
        {cargando ? (
          <View style={styles.centro}>
            <ActivityIndicator
              size="large"
              color="#E83152"
            />
            <Text style={styles.mensaje}>
              Preparando tu catálogo...
            </Text>
          </View>
        ) : error && peliculas.length === 0 ? (
          <View style={styles.centro}>
            <Text style={styles.mensaje}>{error}</Text>

            <Pressable
              style={styles.botonPrincipal}
              onPress={() => obtenerPeliculas()}
            >
              <Text style={styles.textoPrincipal}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            key={columnas}
            data={peliculasFiltradas}
            numColumns={columnas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemColumna}>
                <TarjetaPelicula pelicula={item} />
              </View>
            )}
            ListHeaderComponent={<Encabezado />}
            ListEmptyComponent={
              <View style={styles.vacio}>
                <Text style={styles.iconoVacio}>⌕</Text>
                <Text style={styles.mensaje}>
                  No encontramos películas con esos filtros.
                </Text>
              </View>
            }
            contentContainerStyle={styles.lista}
            columnWrapperStyle={styles.filaPeliculas}
            refreshing={actualizando}
            onRefresh={() => obtenerPeliculas(true)}
          />
        )}
      </View>

      {/* Ventana de detalles */}
      <Modal
        transparent
        visible={seleccionada !== null}
        animationType="fade"
        onRequestClose={() => setSeleccionada(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {seleccionada && (
              <>
                <View style={styles.modalPoster}>
                  <Poster pelicula={seleccionada} grande />
                </View>

                <Text style={styles.modalTitulo}>
                  {seleccionada.title}
                </Text>

                <Text style={styles.modalDato}>
                  Identificador: {seleccionada.id}
                </Text>

                <Text style={styles.modalDato}>
                  Año de estreno: {seleccionada.releaseYear}
                </Text>

                <Text style={styles.modalNota}>
                  Información obtenida de la API oficial
                  de React Native.
                </Text>

                <Pressable
                  style={styles.botonCerrar}
                  onPress={() => setSeleccionada(null)}
                >
                  <Text style={styles.textoCerrar}>
                    Cerrar detalles
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#090B13',
  },
  areaPrincipal: {
    flex: 1,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  contenidoSuperior: {
    marginBottom: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcono: {
    color: '#E83152',
    fontSize: 23,
    marginRight: 10,
  },
  logo: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoRojo: {
    color: '#E83152',
  },
  botonRecargar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2030',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
  },
  iconoRecargar: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 26,
  },
  textoRecargar: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  destacada: {
    backgroundColor: '#192031',
    borderRadius: 22,
    padding: 22,
    marginBottom: 28,
    overflow: 'hidden',
  },
  destacadaHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 30,
  },
  infoDestacada: {
    flex: 1,
    justifyContent: 'center',
  },
  etiquetaDestacada: {
    color: '#FB7185',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 14,
  },
  tituloDestacada: {
    fontSize: 33,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 10,
  },
  metaDestacada: {
    color: '#B8C1D2',
    fontSize: 13,
    marginBottom: 15,
  },
  descripcionDestacada: {
    color: '#A7B2C5',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 380,
    marginBottom: 20,
  },
  botonPrincipal: {
    backgroundColor: '#E83152',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignSelf: 'flex-start',
  },
  textoPrincipal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  posterDestacado: {
    width: 175,
    alignSelf: 'center',
    marginTop: 20,
  },
  areaBusqueda: {
    marginBottom: 18,
  },
  buscador: {
    backgroundColor: '#1A202F',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
  },
  iconoBuscar: {
    color: '#9DA8BA',
    fontSize: 30,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    outlineStyle: 'none',
  } as any,
  limpiar: {
    color: '#9DA8BA',
    fontSize: 17,
    padding: 6,
  },
  filtrosScroll: {
    flexGrow: 0,
    marginBottom: 25,
  },
  filtros: {
    gap: 10,
    paddingRight: 5,
  },
  chip: {
    backgroundColor: '#1E2433',
    borderRadius: 30,
    paddingHorizontal: 17,
    paddingVertical: 11,
  },
  chipActivo: {
    backgroundColor: '#E83152',
  },
  textoChip: {
    color: '#C2CCDB',
    fontSize: 12,
    fontWeight: '600',
  },
  textoChipActivo: {
    color: '#FFFFFF',
  },
  filaSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  tituloSeccion: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },
  subtituloSeccion: {
    color: '#8490A5',
    fontSize: 12,
    marginTop: 5,
  },
  contador: {
    color: '#A5AFC2',
    fontSize: 12,
  },
  filaPeliculas: {
    gap: 14,
    marginBottom: 20,
  },
  itemColumna: {
    flex: 1,
    minWidth: 0,
  },
  tarjeta: {
    backgroundColor: '#151A27',
    borderRadius: 17,
    overflow: 'hidden',
    flex: 1,
  },
  poster: {
    borderRadius: 13,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    width: '100%',
  },
  circuloExterior: {
    width: 126,
    height: 126,
    borderWidth: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 15,
  },
  circuloInterior: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoPoster: {
    fontSize: 39,
    fontWeight: '200',
  },
  posterInferior: {
    position: 'absolute',
    bottom: 14,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  tituloPoster: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  frasePoster: {
    color: '#C5C9D3',
    fontSize: 7,
    letterSpacing: 1,
    marginTop: 5,
    textAlign: 'center',
  },
  lineaPoster: {
    width: 28,
    height: 2,
    marginTop: 9,
    borderRadius: 2,
  },
  infoTarjeta: {
    padding: 13,
  },
  tituloTarjeta: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filaTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  anioTarjeta: {
    color: '#8F9BB0',
    fontSize: 11,
  },
  flecha: {
    color: '#FB7185',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  mensaje: {
    color: '#C3CDDC',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  vacio: {
    alignItems: 'center',
    padding: 40,
  },
  iconoVacio: {
    fontSize: 50,
    color: '#E83152',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#1A2030',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  modalPoster: {
    width: 180,
    marginBottom: 20,
  },
  modalTitulo: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalDato: {
    color: '#C6D0DF',
    fontSize: 15,
    marginBottom: 9,
  },
  modalNota: {
    color: '#8794AA',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 19,
  },
  botonCerrar: {
    width: '100%',
    backgroundColor: '#E83152',
    borderRadius: 12,
    marginTop: 22,
    paddingVertical: 14,
  },
  textoCerrar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
