import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Archive, 
  Eye, 
  CheckCircle, 
  DollarSign, 
  Home,
  MessageSquare,
  Clock,
  Filter,
  Search,
  ExternalLink,
  Star,
  AlertCircle,
  Trash2,
  MoreVertical,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { useContactStore, ContactMessage } from '../stores/contactStore';
import { useAuthStore } from '../stores/authStore';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ContactMessages = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { 
    messages, 
    loading, 
    fetchMessages, 
    updateMessageStatus, 
    archiveMessage,
    getActiveMessages,
    getArchivedMessages 
  } = useContactStore();
  
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [displayedMessages, setDisplayedMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let filtered = activeTab === 'active' ? getActiveMessages() : getArchivedMessages();
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.whatsapp.includes(searchTerm) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtro de estado
    if (statusFilter) {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }
    
    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setDisplayedMessages(filtered);
  }, [messages, activeTab, searchTerm, statusFilter]);

  const handleStatusChange = async (messageId: string, newStatus: ContactMessage['status']) => {
    try {
      await updateMessageStatus(messageId, newStatus);
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleArchive = async (messageId: string) => {
    if (confirm('¿Estás seguro que deseas archivar este mensaje?')) {
      try {
        await archiveMessage(messageId);
        toast.success('Mensaje archivado correctamente');
      } catch (error) {
        toast.error('Error al archivar el mensaje');
      }
    }
  };

  const getStatusBadgeVariant = (status: ContactMessage['status']) => {
    switch (status) {
      case 'nuevo': return 'error';
      case 'leido': return 'warning';
      case 'contactado': return 'info';
      case 'pagado': return 'success';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status: ContactMessage['status']) => {
    switch (status) {
      case 'nuevo': return '🔴 Nuevo';
      case 'leido': return '👁️ Leído';
      case 'contactado': return '📞 Contactado';
      case 'pagado': return '💰 Pagado';
      default: return status;
    }
  };

  const getStatusIcon = (status: ContactMessage['status']) => {
    switch (status) {
      case 'nuevo': return <AlertCircle className="h-4 w-4" />;
      case 'leido': return <Eye className="h-4 w-4" />;
      case 'contactado': return <Phone className="h-4 w-4" />;
      case 'pagado': return <DollarSign className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'nuevo', label: '🔴 Nuevo' },
    { value: 'leido', label: '👁️ Leído' },
    { value: 'contactado', label: '📞 Contactado' },
    { value: 'pagado', label: '💰 Pagado' }
  ];

  const statusChangeOptions = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'leido', label: 'Leído' },
    { value: 'contactado', label: 'Contactado' },
    { value: 'pagado', label: 'Pagado' }
  ];

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  const getMessagePriority = (message: ContactMessage) => {
    const hoursOld = (new Date().getTime() - new Date(message.createdAt).getTime()) / (1000 * 60 * 60);
    if (message.status === 'nuevo' && hoursOld > 24) return 'high';
    if (message.status === 'nuevo') return 'medium';
    return 'low';
  };

  const exportMessages = () => {
    const csvContent = [
      ['Nombre', 'WhatsApp', 'Email', 'Estado', 'Fecha', 'Mensaje'].join(','),
      ...displayedMessages.map(msg => [
        msg.name,
        msg.whatsapp,
        msg.email,
        getStatusLabel(msg.status),
        formatDate(msg.createdAt, 'dd/MM/yyyy HH:mm'),
        `"${msg.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mensajes-contacto-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (user?.role !== 'superadmin') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No tienes permisos para acceder a esta página
        </p>
      </div>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin w-12 h-12 border-b-2 border-primary-600 rounded-full"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Cargando mensajes...</p>
      </div>
    );
  }

  const activeMessages = getActiveMessages();
  const archivedMessages = getArchivedMessages();
  const newMessages = activeMessages.filter(msg => msg.status === 'nuevo');
  const urgentMessages = activeMessages.filter(msg => getMessagePriority(msg) === 'high');

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <Home className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              📨 Mensajes de Contacto
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona las solicitudes de giftcards de tus clientes
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={exportMessages}
          >
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Activos</p>
                <p className="text-2xl font-bold">{activeMessages.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Nuevos</p>
                <p className="text-2xl font-bold">{newMessages.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Urgentes</p>
                <p className="text-2xl font-bold">{urgentMessages.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Archivados</p>
                <p className="text-2xl font-bold">{archivedMessages.length}</p>
              </div>
              <Archive className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full lg:w-auto">
              <Input
                placeholder="🔍 Buscar por nombre, email, teléfono o mensaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftAdornment={<Search className="h-5 w-5 text-gray-400" />}
              />
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                leftAdornment={<Filter className="h-5 w-5 text-gray-400" />}
              />
              
              <Button
                variant={activeTab === 'active' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('active')}
                leftIcon={<MessageSquare className="h-4 w-4" />}
              >
                Activos ({activeMessages.length})
              </Button>
              
              <Button
                variant={activeTab === 'archived' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('archived')}
                leftIcon={<Archive className="h-4 w-4" />}
              >
                Archivados ({archivedMessages.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de mensajes */}
      {displayedMessages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || statusFilter 
                  ? 'No se encontraron mensajes' 
                  : `No hay mensajes ${activeTab === 'active' ? 'activos' : 'archivados'}`
                }
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : activeTab === 'active' 
                    ? 'Los nuevos mensajes de contacto aparecerán aquí cuando los clientes soliciten información sobre giftcards'
                    : 'Los mensajes archivados aparecerán aquí'
                }
              </p>
              {(searchTerm || statusFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedMessages.map((message) => {
            const priority = getMessagePriority(message);
            const timeAgo = getTimeAgo(message.createdAt);
            
            return (
              <Card 
                key={message.id} 
                className={`hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${
                  priority === 'high' ? 'ring-2 ring-red-200 dark:ring-red-800' : ''
                } ${
                  message.status === 'nuevo' ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar y prioridad */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          priority === 'high' ? 'bg-red-500' :
                          priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {message.name.charAt(0).toUpperCase()}
                        </div>
                        {priority === 'high' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">!</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Información principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {message.name}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(message.status)} className="flex items-center gap-1">
                            {getStatusIcon(message.status)}
                            {getStatusLabel(message.status)}
                          </Badge>
                          {priority === 'high' && (
                            <Badge variant="error" className="animate-pulse">
                              🚨 Urgente
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(message.createdAt, 'dd/MM/yyyy')}</span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {timeAgo}
                            </span>
                          </div>
                        </div>
                        
                        {/* Información de contacto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-green-500" />
                            <span className="text-gray-600 dark:text-gray-400">WhatsApp:</span>
                            <a 
                              href={`https://wa.me/${message.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1"
                            >
                              {message.whatsapp}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-400">Email:</span>
                            <a 
                              href={`mailto:${message.email}`}
                              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                              {message.email}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                        
                        {/* Mensaje */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border-l-4 border-primary-500">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-medium text-gray-900 dark:text-white">💬 Mensaje:</span><br />
                            {message.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  {activeTab === 'active' && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Cambiar estado:
                        </span>
                        <Select
                          options={statusChangeOptions}
                          value={message.status}
                          onChange={(value) => handleStatusChange(message.id, value as ContactMessage['status'])}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Archive className="h-4 w-4" />}
                          onClick={() => handleArchive(message.id)}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Archivar
                        </Button>
                        
                        {message.status === 'nuevo' && (
                          <Button
                            size="sm"
                            leftIcon={<Eye className="h-4 w-4" />}
                            onClick={() => handleStatusChange(message.id, 'leido')}
                          >
                            Marcar como leído
                          </Button>
                        )}
                        
                        {message.status === 'leido' && (
                          <Button
                            size="sm"
                            leftIcon={<Phone className="h-4 w-4" />}
                            onClick={() => handleStatusChange(message.id, 'contactado')}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            Marcar como contactado
                          </Button>
                        )}
                        
                        {message.status === 'contactado' && (
                          <Button
                            size="sm"
                            leftIcon={<DollarSign className="h-4 w-4" />}
                            onClick={() => handleStatusChange(message.id, 'pagado')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Marcar como pagado
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Información de ayuda */}
      {activeTab === 'active' && displayedMessages.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  💡 Consejos para gestionar mensajes
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Los mensajes marcados como "Urgentes" 🚨 llevan más de 24 horas sin respuesta</li>
                  <li>• Usa los enlaces de WhatsApp y Email para contactar directamente</li>
                  <li>• Cambia el estado según el progreso: Nuevo → Leído → Contactado → Pagado</li>
                  <li>• Archiva los mensajes completados para mantener la bandeja organizada</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactMessages;