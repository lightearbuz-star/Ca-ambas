import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapView } from "@/components/Map";
import { Search, MapPin, AlertCircle } from "lucide-react";

interface CepSearchProps {
  onLocationSelected: (data: {
    cep: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialCep?: string;
  initialEndereco?: string;
}

export function CepSearch({ onLocationSelected, initialCep = "", initialEndereco = "" }: CepSearchProps) {
  const [cep, setCep] = useState(initialCep);
  const [endereco, setEndereco] = useState(initialEndereco);
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [latitude, setLatitude] = useState(-22.9068);
  const [longitude, setLongitude] = useState(-43.1729);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapInstance, setMapInstance] = useState<any>(null);
  const markerRef = useRef<any>(null);

  // Formatar CEP
  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  // Buscar endereço por CEP
  const buscarCep = async () => {
    if (!cep.replace(/\D/g, "").match(/^\d{8}$/)) {
      setError("CEP inválido. Digite 8 dígitos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cepLimpo = cep.replace(/\D/g, "");
      
      // Usar ViaCEP API
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError("CEP não encontrado");
        setLoading(false);
        return;
      }

      // Atualizar campos
      setEndereco(data.logradouro || "");
      setBairro(data.bairro || "");
      setCidade(data.localidade || "");
      setEstado(data.uf || "");

      // Geocodificar para obter coordenadas
      if (window.google && mapInstance) {
        const geocoder = new google.maps.Geocoder();
        // Usar CEP para geocodificação mais precisa
        const fullAddress = `${cepLimpo}, Brasil`;

        geocoder.geocode({ address: fullAddress }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const location = results[0].geometry.location;
            setLatitude(location.lat());
            setLongitude(location.lng());

            // Atualizar mapa
            if (mapInstance) {
              mapInstance.setCenter(location);
              mapInstance.setZoom(17);

              // Remover marcador anterior
              if (markerRef.current) {
                markerRef.current.setMap(null);
              }

              // Criar novo marcador arrastável
              markerRef.current = new google.maps.Marker({
                position: location,
                map: mapInstance,
                draggable: true,
                title: "Arraste para ajustar a localização",
              });

              // Atualizar coordenadas ao arrastar
              markerRef.current.addListener("dragend", () => {
                const newPos = markerRef.current.getPosition();
                setLatitude(newPos.lat());
                setLongitude(newPos.lng());
              });
            }
          } else {
            setError("Não foi possível geocodificar o endereço");
          }
          setLoading(false);
        });
      }
    } catch (err) {
      setError("Erro ao buscar CEP");
      setLoading(false);
    }
  };

  // Confirmar localização
  const confirmarLocalizacao = () => {
    if (!endereco || !numero || !cidade || !estado) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    onLocationSelected({
      cep: cep.replace(/\D/g, ""),
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      latitude,
      longitude,
    });
  };

  const handleMapReady = useCallback((map: any) => {
    setMapInstance(map);

    // Criar marcador inicial
    const initialLocation = { lat: latitude, lng: longitude };
    map.setCenter(initialLocation);
    map.setZoom(15);

    markerRef.current = new google.maps.Marker({
      position: initialLocation,
      map: map,
      draggable: true,
      title: "Arraste para ajustar a localização",
    });

    markerRef.current.addListener("dragend", () => {
      const newPos = markerRef.current.getPosition();
      setLatitude(newPos.lat());
      setLongitude(newPos.lng());
    });
  }, [latitude, longitude]);

  return (
    <div className="space-y-4">
      {/* Busca por CEP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar por CEP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o CEP (ex: 12345-678)"
              value={cep}
              onChange={(e) => setCep(formatCep(e.target.value))}
              maxLength={9}
              onKeyPress={(e) => e.key === "Enter" && buscarCep()}
            />
            <Button onClick={buscarCep} disabled={loading} className="min-w-fit">
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Campos de endereço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Endereço</label>
              <Input value={endereco} readOnly className="mt-1 bg-gray-100" />
            </div>
            <div>
              <label className="text-sm font-medium">Número *</label>
              <Input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Digite o número"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Complemento</label>
              <Input
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Apto, sala, etc"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bairro</label>
              <Input value={bairro} readOnly className="mt-1 bg-gray-100" />
            </div>
            <div>
              <label className="text-sm font-medium">Cidade</label>
              <Input value={cidade} readOnly className="mt-1 bg-gray-100" />
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              <Input value={estado} readOnly className="mt-1 bg-gray-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa Interativo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Ajuste a Localização no Mapa
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Arraste o marcador para ajustar a localização se necessário
          </p>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
            <MapView onMapReady={handleMapReady} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Latitude: {latitude.toFixed(6)} | Longitude: {longitude.toFixed(6)}
          </p>
        </CardContent>
      </Card>

      {/* Botão de Confirmação */}
      <Button onClick={confirmarLocalizacao} className="w-full" size="lg">
        Confirmar Localização
      </Button>
    </div>
  );
}
